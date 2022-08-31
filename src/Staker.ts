import { DestinationTransferPeerPath, FireblocksSDK, PeerType, TransactionArguments, TransactionOperation } from 'fireblocks-sdk';
import Web3 from 'web3';
import { typecheck, waitForTx } from './Utils';
import {inspect} from 'util';

/**
 * This class provides the basic building blocks for a staker.
 * A staker is a class which provides logic for implementing staking transactions to a given blockchain.
 * Each Staker class is reponsible for implementing it's own calls, requests and caluclations.
 */
export abstract class Staker {

    /**
     * In case logging should not be done, this attribute can be changed statically.
     */
    public static shouldLog : boolean = true;

    /**
     * An internal member, uesd for logging purposes.
     */
    protected caller: string = 'Staker';

    /**
     * Constructor for a staker.
     * @param fbks Fireblocks SDK instance.
     * @param web3 Web3 instance for the relevnat blockchain, this should point to the RPC endpoint for the blockchain.
     * Note: some blockchains (such as NEAR) will not require an RPC endpoint.
     * @see https://chainlist.org/ - for list of blockchain RPC addresses.
     */
    constructor(protected fbks: FireblocksSDK, protected assetId: string, protected vaultAccountId: number, protected web3?: Web3) {}
    
    /**
     * Performs the stake operation.
     */
    abstract stake(amount: number) : void;

    /**
     * Restake some amount.
     * @param amount the amount to restake.
     */
    abstract restake(amount: number) : void;

    /**
     * Finds the amount that you currently have staked in the given blockchain.
     */
    abstract getBalances(smallestDenom: boolean) : Promise<number[]>;

    /**
     * Unstakes a given amount.
     * @param amount - the amount to unstake.
     */
    abstract unstake(amount: number) : void;

    /**
     * Withdraws a given amount.
     * @param amount - the amount to withdraw.
     */
    abstract withdraw(amount: number) : void;

    /**
     * Claims all the rewards accumulated thus far.
     */
    abstract claimRewards(): void;

    /**
     * Setups up the staker, may not be called, depending on the need of the relevant staker.
     */
    abstract setup(): void;

    /**
     * Runs the setup function if it is needed.
     */
    abstract runSetupIfNeeded(): void;

    warn = (msg: string) => this.log(msg, 'WRN');
    err = (msg: string) => this.log(msg, 'ERR');

    log(msg: string, lvl: string = 'LOG') {
        if(!Staker.shouldLog) return;
        let ts = new Date(Date.now()).toISOString()
        console.log(`[${ts}] [${this.caller}] [${lvl.toUpperCase()}] - ${msg}`);
    }

    async issueTx(txPayload: TransactionArguments) : Promise<string>{
        this.log(`Going to send following request for transaction:\n${inspect(txPayload, false, null, true)}`, 'DBG');

        let txCreationResponse = await this.fbks.createTransaction(txPayload);
        let txId = txCreationResponse.id;

        this.log(`Called Tx, generated Id: ${txId}, waiting for it to be completed.`);

        await waitForTx(this.fbks, txId, this);

        this.log(`Tx approved ${txId}.`);

        return new Promise((resolve) => { resolve(txId) });
    }

    standardTx(destination: DestinationTransferPeerPath, 
        extraParameters: object, 
        note: string | undefined = undefined,
        amount: string = "0", 
        operation: TransactionOperation = TransactionOperation.CONTRACT_CALL): TransactionArguments{
        typecheck(amount, typeof "1");
        try{
            typecheck(note, typeof "");
        }catch{
            typecheck(note, typeof undefined);
        }

        let txPayload: TransactionArguments = {
            assetId: this.assetId,
            source: {
                type: PeerType.VAULT_ACCOUNT,
                id: "" + this.vaultAccountId
            },
            destination: destination,
            amount: amount,
            operation: operation,
            extraParameters: extraParameters
        };

        if(note !== undefined){
            txPayload.note = note;
        }

        return txPayload;
    }
}