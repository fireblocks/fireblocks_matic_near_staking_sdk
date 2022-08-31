import { DestinationTransferPeerPath, ExternalWalletAsset, FireblocksSDK, PeerType, TransactionArguments, TransactionOperation, WalletContainerResponse } from "fireblocks-sdk";
import Web3 from "web3";
import { fromWei, numberToHex, toWei } from "web3-utils";
import { Staker } from "../Staker";
import { Constants, typecheck } from "../Utils";
import { Contract } from "web3-eth-contract";

/**
 * A Staker for the MATIC (formally Polygon) token.
 */
export class MATICStaker extends Staker {

    /**
     * The ID of the external wallet holding the MATIC Token address (in case of multiple - the first one).
     */
    private externalWalletIdMaticToken: string | undefined;

    /**
     * The ID of the external wallet holding the validator's address (in case of multiple - the first one).
     */
    private externalWalletIdValidator: string | undefined;

    /**
     * The address of the MATIC wallet in the provided vault account (note that in case of multiple, only the first is selected).
     */
    private sourceAddr: string;

    /**
     * An ethereum web3 instance for read contract calls against the contracts.
     */
    private ethWeb3: Web3;

    /**
     * The contract for the validator.
     */
    private targetContract: Contract;

    /**
     * The address of the validator proxy contract for the specified validator.
     */
    private contractAddress: string;

    /**
     * The destination of the validator address.
     */
    private validatorDestination: DestinationTransferPeerPath;

    constructor(fbks: FireblocksSDK,
        vaultAccountId: number,
        private validatorId: number = 87,
        web3: Web3 = new Web3(Constants.MATIC.WEB3_ADDRESS)) {
        super(fbks, 'ETH', vaultAccountId, web3);
        this.caller = 'MATIC-Staker';
        this.ethWeb3 = new Web3(Constants.WEB3_ETH_RPC_ENDPOINT);
    }

    async setup(): Promise<void> {
        if (this.vaultAccountId < 0) {
            throw new Error('Vault account Id must be a non-negative integer.');
        }

        if (this.validatorId < 0) {
            throw new Error('Validator Id must be a positive integer.');
        }

        this.contractAddress = await this.getValidatorContractAdress(this.validatorId);

        let allExternalWallets: WalletContainerResponse<ExternalWalletAsset>[] = await this.fbks.getExternalWallets();
        let externalWalletsWithValidatorAddress = allExternalWallets.filter((xWallet) => {
            return xWallet.assets.filter((walletAsset) => {
                return walletAsset.address === this.contractAddress
            }).length > 0;
        });


        if (externalWalletsWithValidatorAddress.length === 0) {
            throw new Error(`Address ${this.contractAddress} is not whitelisted on any External Wallet, the address must be whitelisted to allow staking.`);
        } else {
            if (externalWalletsWithValidatorAddress.length > 1) {
                this.log('Found multiple wallets with same validator address, using the first one.', 'WRN');
            }
            this.externalWalletIdValidator = externalWalletsWithValidatorAddress[0].id;
        }

        let externalWalletsWithMaticTokenAddress = allExternalWallets.filter((xWallet) => {
            return xWallet.assets.filter((walletAsset) => {
                return walletAsset.address === Constants.MATIC.MATIC_CONTRACT_ADDR;
            }).length > 0;
        });
        if (externalWalletsWithMaticTokenAddress.length === 0) {
            throw new Error(`Address ${Constants.MATIC.MATIC_CONTRACT_ADDR} - the genesis MATIC token contract - must be whitelisted to allow staking.`);
        } else {
            if (externalWalletsWithMaticTokenAddress.length > 1) {
                this.log('Found multiple wallets with same MATIC token contract address, using the first one.', 'WRN');
            }
            this.externalWalletIdMaticToken = externalWalletsWithMaticTokenAddress[0].id;
        }

        let depositAddresses = await this.fbks.getDepositAddresses("" + this.vaultAccountId, this.assetId);
        if (depositAddresses.length > 1) {
            this.log(`More than one MATIC deposit address for vault account ${this.vaultAccountId}.`, 'WRN');
        } else if (depositAddresses.length === 0) {
            this.log(`No MATIC deposit addresses in vault account ${this.vaultAccountId}, not showing staked amount.`, 'ERR');
            return;
        }

        this.sourceAddr = depositAddresses[0].address;
        this.targetContract = new this.ethWeb3.eth.Contract(Constants.MATIC.ABI, this.contractAddress);

        this.validatorDestination = {
            type: PeerType.EXTERNAL_WALLET,
            id: this.externalWalletIdValidator
        }
    }

    async runSetupIfNeeded(): Promise<void> {
        if (this.ethWeb3 === undefined || this.sourceAddr === undefined) {
            this.log('Setup was not ran, running.', 'ERR');
            await this.setup();
        }
    }

    /**
     * Performs the actual stake operation.
     * There are two stages in this scenario, approve (approve the withdrawal of tokens from your wallet in the specified amount), buyVoucher (Buys token which mark you as a delegator, these tokens are later sold for MATIC tokens at a rate).
     * @param amount - the amount to stake in MATIC tokens.
     * @param approveAmount - the amount to approve in MATIC tokens, if -1, the value in amount will be approved.
     * @param skipApprove - skip the approve contract call.
     * @param skipBuyVoucher - skip the buy voucher contract call.
     */
    async stake(amount: number, approveAmount: number = -1, skipApprove: boolean = false, skipBuyVoucher: boolean = false) {
        await this.runSetupIfNeeded();

        typecheck(amount, typeof 1);
        typecheck(approveAmount, typeof 1);
        typecheck(skipApprove, typeof true);
        typecheck(skipBuyVoucher, typeof true);

        if (skipApprove && skipBuyVoucher) {
            this.log("Skip approve and skip buyVoucher are both set, nothing to do.");
            return;
        }

        if (!skipApprove) {
            this.log('Preparing \'approve\' function call.');
            let amountToApprove = approveAmount === -1 ? amount : approveAmount;
            let weiToApprove = numberToHex(toWei("" + amountToApprove));
            let callData = [Constants.MATIC.MATIC_PROOF_OF_STAKE_CONTRACT_ADDR, weiToApprove];
            let encodedCallData = this.web3?.eth.abi.encodeFunctionCall(Constants.MATIC.APPROVE_ABI, callData);

            let txPayload = this.standardTx(
                { type: PeerType.EXTERNAL_WALLET, id: this.externalWalletIdMaticToken },
                { contractCallData: encodedCallData },
                'MATIC Staking (Stake) - approve'
            );

            let txId = await this.issueTx(txPayload);

            this.log(`Approve call completed - tx id: ${txId}`);
        }

        if (!skipBuyVoucher) {
            this.log('Preparing \'buyVoucher\' contract call.');
            let weiToDelegate = numberToHex(toWei("" + amount));
            let callData = [weiToDelegate, numberToHex(0)];
            let encodedCallData = this.web3?.eth.abi.encodeFunctionCall(Constants.MATIC.BUY_VOUCHER_ABI, callData);

            let txPayload = this.standardTx(
                this.validatorDestination,
                { contractCallData: encodedCallData },
                'MATIC Staking (Stake) - buyVoucher'
            );

            let txId = await this.issueTx(txPayload);

            this.log(`Staking completed - tx id: ${txId}`);
        }
    }

    async restake(): Promise<void> {
        await this.runSetupIfNeeded();

        let minRestakeAmount = await this.targetContract.methods.minAmount().call();
        let balances = await this.getBalances();

        if (balances[2] < minRestakeAmount) {
            throw new Error(`Minimal restake amount is ${fromWei(minRestakeAmount)} MATIC, available rewards is ${fromWei("" + balances[2])} MATIC.`);
        }

        this.log('Restaking on MATIC will consume your rewards, and return the remainder.', 'WRN');

        let encodedCallData = this.web3.eth.abi.encodeFunctionCall(Constants.MATIC.RESTAKE_ABI, []);
        let txPayload = this.standardTx(
            this.validatorDestination,
            { contractCallData: encodedCallData },
            'MATIC Staking (Restake) - restake'
        )

        let txId = await this.issueTx(txPayload);

        this.log(`Restaking completed - tx id: ${txId}`);
    }

    /**
     * Gets the balances.
     * @param smallestDenom - return results in wei.
     * @returns an array [total (staked + rewards), staked tokens, accumulated rewards].
     */
    async getBalances(smallestDenom: boolean = true): Promise<number[]> {
        await this.runSetupIfNeeded();
        typecheck(smallestDenom, typeof true);
        this.log('Finding staking balances.');

        let staked = await this.targetContract.methods.balanceOf(this.sourceAddr).call();
        let rewards = await this.targetContract.methods.getLiquidRewards(this.sourceAddr).call();
        staked = Number.parseFloat(smallestDenom ? staked : fromWei(staked));
        rewards = Number.parseFloat(smallestDenom ? rewards : fromWei(rewards));

        return new Promise((resolve) => { resolve([(staked + rewards), staked, rewards]); })
    }

    /**
     * Unstakes a given amount.
     * @param amount - the amount to unstake, if -1 will get total staked amount and unstake it (including rewards).
     * @param sharesToBurn - the amount of shares to burn, if -1 will put the same value as the amount.
     * Note - shares to token is not 1:1, usually 1 token is more than several tokens, thus the use of the amount is almost guaranteed to not cause issues.
     */
    async unstake(amount: number, sharesToBurn: number = -1) {
        await this.runSetupIfNeeded();
        typecheck(amount, typeof 1);
        typecheck(sharesToBurn, typeof 1);

        this.log('Perparing \'sellVoucher_new\' call.');
        if (amount === 0) {
            this.log('Unable to unstake 0 MATIC.', 'ERR');
            return;
        }

        this.log('Note: unstaked assets are locked and can only be withdrawn after 82 epochs.')

        let balances = await this.getBalances();
        let amountToUnstake;
        if (amount === -1) {
            amountToUnstake = numberToHex(balances[2]);
        } else {
            if (amount > balances[2]) {
                this.log('Requested to unstake more than currently staked.', 'ERR');
                return;
            }
            amountToUnstake = numberToHex(amount);
        }

        let callData = [amountToUnstake, sharesToBurn === -1 ? amountToUnstake : numberToHex(toWei("" + sharesToBurn))];
        let encodedCallData = this.web3?.eth.abi.encodeFunctionCall(Constants.MATIC.SELL_VOUCHER_ABI, callData);

        let txPayload = this.standardTx(
            this.validatorDestination,
            { contractCallData: encodedCallData },
            'MATIC Staking (Unstake) - sellVoucher_new'
        );

        await this.issueTx(txPayload);

        this.log('Unstake completed.');

    }

    /**
     * Reclaims token associated with a given nonce.
     * @param nonce The nonce to reclaim.
     */
    async withdraw(nonce: number) {
        await this.runSetupIfNeeded();
        typecheck(nonce, typeof 1);
        
        if (nonce < 1) {
            this.log('Nonce should be positive number.', 'ERR');
            return;
        }
        Staker.shouldLog = false;
        let noncesEligibleForWithdrawal: number[] = await this.canWithdrawStakes();
        Staker.shouldLog = true;
        this.log(`Checking if can withdraw nonce ${nonce}.`);

        if (!noncesEligibleForWithdrawal.includes(nonce)) {
            this.log(`Nonce ${nonce} is not eligible for withdrawal.`, 'ERR');
            return;
        }

        let callData = [numberToHex(nonce)];
        let encodedCallData = this.web3.eth.abi.encodeFunctionCall(Constants.MATIC.WITHDRAW_ABI, callData);

        let txPayload = this.standardTx(
            this.validatorDestination,
            {contractCallData: encodedCallData},
            'MATIC Staking (Withdraw) - unstakeClaimTokens_new'
        );

        let txId = await this.issueTx(txPayload);

        this.log(`Withdrawal completed - tx id: ${txId}`);
    }

    async claimRewards(): Promise<void> {
        await this.runSetupIfNeeded();

        this.log('Validating claim rewards call.');

        let balances = await this.getBalances(false);
        if(balances[2] < 1){
            throw new Error(`Claiming rewards on MATIC requires that you have at least 1 MATIC in rewards, currently available rewards are ${balances[2]}.`);
        }

        let encodedCallData = this.web3.eth.abi.encodeFunctionCall(Constants.MATIC.WITHDRAW_REWARDS_ABI, []);
        let txPayload = this.standardTx(
            this.validatorDestination,
            {contractCallData: encodedCallData},
            "MATIC Staking (Claim Rewards) - withdrawRewards"
        );

        this.log('Issuing claim rewards call.');

        let txId = await this.issueTx(txPayload);

        this.log(`Claim rewards call completed - tx id: ${txId}.`);
    }

    /**
     * This method will check if there are any stakes that can be withdrawn.
     * This is done by looking at all the unbondNonces available for withdral and checking if 82 epochs have passed since they were created (82 to be on the safe side).
     * @return - a number array with the nonces that can be withdrawn.
     */
    async canWithdrawStakes(): Promise<number[]> {
        await this.runSetupIfNeeded();
        this.log('Checking if any stakes can be withdrawn.');

        let stakeManagerForTargetContract = await this.targetContract.methods.stakeManager().call();
        let stakeManager = new this.ethWeb3.eth.Contract([Constants.MATIC.EPOCH_ABI], stakeManagerForTargetContract);

        let currentEpoch = await stakeManager.methods.epoch().call();
        let unbondNonces = await this.targetContract.methods.unbondNonces(this.sourceAddr).call();

        let res: number[] = [];
        for (let i = 1; i <= unbondNonces; i++) {
            this.log(`Checking withdraw for nonce ${i}.`);
            let unbondResponse = await this.targetContract.methods.unbonds_new(this.sourceAddr, i).call();

            if (unbondResponse.shares === '0') {
                this.log(`Nonce ${i} was already withdrawn.`);
                continue;
            }

            let withdrawEpoch = Number.parseInt(unbondResponse.withdrawEpoch);
            let maticStake = fromWei(unbondResponse.shares);
            if (currentEpoch - withdrawEpoch < 82) {
                this.log(`Nonce ${i} for ${maticStake} is not eligible for withdrawal.`);
                continue;
            }

            this.log(`Nonce ${i} for ${maticStake} is eligible for withdrawal.`);
            res.push(i);
        }

        return new Promise((resolve) => { resolve(res); });
    }

    async getValidatorContractAdress(validatorId: number){
        let stakingInfoContract = new this.ethWeb3.eth.Contract([Constants.MATIC.GET_VALIDATOR_ADDRESS_ABI], Constants.MATIC.STAKING_INFO_CONTRACT_ADDRESS);
        return await stakingInfoContract.methods.getValidatorContractAddress(validatorId).call();
    }

}
