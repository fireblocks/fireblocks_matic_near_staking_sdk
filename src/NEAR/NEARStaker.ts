import { FireblocksSDK } from "fireblocks-sdk";
import { Account, connect, ConnectConfig, Contract, Near } from "near-api-js";
import { formatNearAmount, parseNearAmount } from "near-api-js/lib/utils/format";
import Web3 from "web3";
import NEARFireblocksSigner from "./NEARFireblocksSigner";
import { Staker } from "../Staker";
import { Constants, typecheck } from "../Utils";
import {inspect} from 'util';

export class NEARStaker extends Staker {

    private near: Near;
    private account: Account;
    private contract: Contract;

    constructor(fbks: FireblocksSDK, vaultAccountId: number,
        private contractName: string = Constants.NEAR.FIGMENT_CONTRACT_ADDRESS,
        isTestnet: boolean = false,
        private config: ConnectConfig | undefined = undefined,
        web3?: Web3) {
        super(fbks, isTestnet ? 'NEAR_TEST' : 'NEAR', vaultAccountId, web3);
        this.caller = 'NEAR-Staker';

        let fbksSigner = new NEARFireblocksSigner(fbks, vaultAccountId, this, this.assetId);
        if(config === undefined){ // Custom config do not need to be edited.
            this.config = JSON.parse(JSON.stringify(isTestnet ? Constants.NEAR.NEAR_TESTNET_CONFIG : Constants.NEAR.NEAR_CONFIG));
        }
        this.config.signer = fbksSigner;
    }

    async setup(): Promise<void> {
        // @ts-ignore
        if (typeof this.config.signer.setup !== "undefined") {
            // @ts-ignore
            await this.config.signer.setup();
        }

        if(this.vaultAccountId < 0){
            this.log('Vault account Id must be a non-negative integer.', 'ERR');
            return;
        }

        this.near = await connect(this.config);

        let pubKey = await this.config.signer.getPublicKey();
        let accountId = Buffer.from(pubKey.data).toString('hex');
        this.account = await this.near.account(accountId);
        this.contract = new Contract(
            this.account,
            this.contractName,
            {
                viewMethods: ['get_account_staked_balance'],
                changeMethods: ['deposit_and_stake', 'stake', 'unstake_all', 'unstake', 'withdraw_all', 'withdraw'],
            }
        );
        console.log(inspect(this.contract, false,null,true))

    }

    async runSetupIfNeeded() {
        if (this.near === undefined || this.contract === undefined || this.account === undefined) {
            this.log('Setup was not ran, running.', 'ERR');
            await this.setup();
        }
    }

    async stake(amount: number): Promise<void> {
        await this.runSetupIfNeeded();
        typecheck(amount, typeof 1);
        this.log('Validating stake request.');
        let nearWallet = await this.fbks.getVaultAccountAsset("" + this.vaultAccountId, this.assetId);
        let nearInWallet = nearWallet.available;
        if (Number.parseFloat(nearInWallet) < amount) {
            throw new Error(`Vault account ${this.vaultAccountId} has ${nearInWallet} NEAR, but requested to stake ${amount}.`);
        }

        this.log('Validated.');
        this.log('Note - stake,unstake and withdraw will print data including reciepts for transaction, make sure to save it for future reference.', 'WRN');

        // @ts-ignore - required because deposit_and_stake is generated at runtime.
        let response = await this.contract.deposit_and_stake({
            args: {},
            amount: parseNearAmount("" + amount)
        });

        this.log(`Staked ${amount} NEAR to ${this.contractName}.`);
    }

    async restake(): Promise<void> {
        throw new Error('Restaking is not a feature on NEAR, simply stake again.');
    }

    async getBalances(smallestDenom: boolean = true): Promise<number[]> {
        await this.runSetupIfNeeded();
        typecheck(smallestDenom, typeof true);
        // @ts-ignore - required because deposit_and_stake is generated at runtime.
        let balance = await this.contract.get_account_staked_balance({ account_id: this.account.accountId });
        if(smallestDenom){
            balance = Number.parseFloat(balance);
        } else {
            balance = Number.parseFloat(formatNearAmount(balance));
        }
        return new Promise((resolve) => {
            resolve([balance])
        });
    }

    /**
     * Unstake an amount.
     * @param amount the amount to unstake, if -1 will unstake entire amount.
     */
    async unstake(amount: number): Promise<void> {
        await this.runSetupIfNeeded();
        typecheck(amount, typeof 1);
        // @ts-ignore - required because deposit_and_stake is generated at runtime.
        let balance = await this.contract.get_account_staked_balance({ account_id: this.account.accountId });
        let stakedNear = formatNearAmount(balance);

        if (amount !== -1 && Number.parseFloat(stakedNear) < amount) {
            throw new Error(`Account has ${stakedNear} staked, can't unstake ${amount}.`);
        }

        this.log('Note - stake,unstake and withdraw will print data including reciepts for transaction, make sure to save it for future reference.', 'WRN');

        if (Number.parseFloat(stakedNear) === amount || amount === -1) {
            this.log('Unstaking all staked amount.');
            // @ts-ignore
            this.contract.unstake_all({});
            return;
        }

        this.log(`Unstaking ${amount}.`);
        // @ts-ignore
        this.contract.unstake({ args: { amount: parseNearAmount("" + amount) } });

        this.log('Withdraw only possible 2 days after unstake happens!');
    }

    /**
     * Withdraw a given amount.
     * @param amount the amount to withdraw, if -1 will withdraw all.
     */
    async withdraw(amount: number): Promise<void> {
        await this.runSetupIfNeeded();
        typecheck(amount, typeof 1);
        this.log('It is not possible to calculate the reward value thus withdraw will attempt to run with the specified amount, if said amount is larger than the total NEAR in the validator, the NEAR node will fail the request.', 'WRN');

        if (amount === -1) {
            // @ts-ignore
            await this.contract.withdraw_all({});
            return;
        }

        // @ts-ignore
        await this.contract.withdraw({ args: { amount: parseNearAmount("" + amount) } });
    }

    async claimRewards(): Promise<void> {
        
    }

}