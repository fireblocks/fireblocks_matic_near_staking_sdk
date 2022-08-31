import { FireblocksSDK, TransactionStatus } from "fireblocks-sdk";
import { AbiItem } from "web3-utils";
import { Staker } from "./Staker";

export class Constants {

    /**
     * Web3 endpoint used for performing ETH related read contract calls. 
     */
    public static readonly WEB3_ETH_RPC_ENDPOINT = 'https://cloudflare-eth.com'

    /**
     * Constants for MATIC staking.
     */
    static MATIC = class {
        /**
         * By default we stake with Figment, this is their contract's address.
         */
        public static readonly FIGMENT_CONTRACT_ADDR = '0xb929B89153fC2eEd442e81E5A1add4e2fa39028f';

        /**
         * Figment's validator ID. 
         */
        public static readonly FIGMENT_VALIDATOR_ID = 87;

        /**
         * The genesis MATIC token contract address.
         */
        public static readonly MATIC_CONTRACT_ADDR = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';

        /**
         * The genesis MATIC POS Contract address.
         */
        public static readonly MATIC_PROOF_OF_STAKE_CONTRACT_ADDR = '0x5e3ef299fddf15eaa0432e6e66473ace8c13d908';

        /**
         * The genesis MATIC StakeManager contract address - used for withdrawal checks. 
         */
        public static readonly MATIC_STAKE_MANAGER_CONTRACT_ADDR = '0x644A0A4a4a9892f57Af7dFF1Db23cE2A235A255e';

        /**
         * The genesis MATIC Staking Info contract address - used for finding the validator address.
         */
        public static readonly STAKING_INFO_CONTRACT_ADDRESS = '0xa59C847Bd5aC0172Ff4FE912C5d29E5A71A7512B';

        /**
         * The address of MATIC Public RPC Endpoint.
         */
        public static readonly WEB3_ADDRESS = 'https://polygon-rpc.com/';

        public static readonly ABI: AbiItem[] = [
            { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_minSharesToMint", "type": "uint256" }], "name": "buyVoucher", "outputs": [{ "internalType": "uint256", "name": "amountToDeposit", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
            { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getTotalStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [], "name": "getRewardPerShare", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getLiquidRewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": false, "inputs": [{ "internalType": "uint256", "name": "claimAmount", "type": "uint256" }, { "internalType": "uint256", "name": "maximumSharesToBurn", "type": "uint256" }], "name": "sellVoucher_new", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "unbondNonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "unbonds", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawEpoch", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "unbonds_new", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawEpoch", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [], "name": "stakeManager", "outputs": [{ "internalType": "contract IStakeManager", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": false, "inputs": [{ "internalType": "uint256", "name": "unbondNonce", "type": "uint256" }], "name": "unstakeClaimTokens_new", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
            { "constant": false, "inputs": [], "name": "restake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
            { "constant": true, "inputs": [], "name": "minAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": false, "inputs": [], "name": "withdrawRewards", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
        ]

        /**
         * The ABI for the BuyVoucher function call, based off the ValidationShare Contract, for which all validators have a proxy contract.
         */
        public static readonly BUY_VOUCHER_ABI: AbiItem = { constant: false, inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }, { internalType: 'uint256', name: '_minSharesToMint', type: 'uint256' }], name: 'buyVoucher', outputs: [{ internalType: 'uint256', name: 'amountToDeposit', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function' };

        /**
         * The ABI for Approve function call.
         */
        public static readonly APPROVE_ABI: AbiItem = { constant: false, inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' };

        /**
         * Four method calls that can be used to calculate stake and rewards in MATIC network. 
         */
        public static readonly SHOW_STAKE_ABI: AbiItem[] = [
            { "constant": true, "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getTotalStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [], "name": "getRewardPerShare", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getLiquidRewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }
        ];

        /**
         * Sell voucher ABI - used for unstaking.
         */
        public static readonly SELL_VOUCHER_ABI: AbiItem = { "constant": false, "inputs": [{ "internalType": "uint256", "name": "claimAmount", "type": "uint256" }, { "internalType": "uint256", "name": "maximumSharesToBurn", "type": "uint256" }], "name": "sellVoucher_new", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" };

        public static readonly WITHDRAW_CHECK_ABI: AbiItem[] = [
            { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "unbondNonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "unbonds", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawEpoch", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "unbonds_new", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawEpoch", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
            { "constant": true, "inputs": [], "name": "stakeManager", "outputs": [{ "internalType": "contract IStakeManager", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }
        ]

        /**
         * ABI For getting the current epoch.
         */
        public static readonly EPOCH_ABI: AbiItem = { "constant": true, "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" };

        /**
         * ABI For actual withdrawal operation.
         */
        public static readonly WITHDRAW_ABI: AbiItem = { "constant": false, "inputs": [{ "internalType": "uint256", "name": "unbondNonce", "type": "uint256" }], "name": "unstakeClaimTokens_new", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" };

        /**
         * ABI For restaking operation.
         */
        public static readonly RESTAKE_ABI: AbiItem = { "constant": false, "inputs": [], "name": "restake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" };

        /**
         * ABI for translating the validator Id to the contract Id.
         */
        public static readonly GET_VALIDATOR_ADDRESS_ABI: AbiItem = { "constant": true, "inputs": [{ "internalType": "uint256", "name": "validatorId", "type": "uint256" }], "name": "getValidatorContractAddress", "outputs": [{ "internalType": "address", "name": "ValidatorContract", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" };

        /**
         * ABI For withdrawing rewards.
         */
        public static readonly WITHDRAW_REWARDS_ABI: AbiItem = { "constant": false, "inputs": [], "name": "withdrawRewards", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" };
    }

}

export async function waitForTx(fbks: FireblocksSDK, txId: string, staker: Staker) {
    let tx = await fbks.getTransactionById(txId);
    while (tx.status !== TransactionStatus.COMPLETED) {
        staker.log(`Waiting for transaction to finish - ${translateSubStatus(tx.subStatus)}`, 'LOG');
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 Second delay.
        tx = await fbks.getTransactionById(txId);

        if (tx.status === TransactionStatus.BLOCKED ||
            tx.status === TransactionStatus.CANCELLED ||
            tx.status === TransactionStatus.FAILED) {
                
            throw new Error(`Transaction ${txId} failed - sub status: ${translateSubStatus(tx.subStatus)}`);
        }
    }
}

function translateSubStatus(subStatus: string){
    let statusToDescriptionMap: Record<string, string> = {
        "INSUFFICIENT_FUNDS": "Not enough funds to fulfill the withdraw request",
        "AMOUNT_TOO_SMALL": "Attempt to withdraw an amount below the allowed minimum",
        "UNSUPPORTED_ASSET": "Asset is not supported",
        "UNAUTHORISED__MISSING_PERMISSION": "Third party (e.g. exchange) API missing permission",
        "INVALID_SIGNATURE": "Invalid transaction signature",
        "API_INVALID_SIGNATURE": "Third party (e.g. exchange) API call invalid signature",
        "UNAUTHORISED__MISSING_CREDENTIALS": "Missing third party (e.g. exchange) credentials",
        "UNAUTHORISED__USER": "Attempt to initiate or approve a transaction by an unauthorised user",
        "UNAUTHORISED__DEVICE": "Unauthorised user's device",
        "INVALID_UNMANAGED_WALLET": "Unmanaged wallet is disabled or does not exist",
        "INVALID_EXCHANGE_ACCOUNT": "Exchange account is disabled or does not exist",
        "INSUFFICIENT_FUNDS_FOR_FEE": "Not enough balance to fund the requested transaction",
        "INVALID_ADDRESS": "Unsupported address format",
        "WITHDRAW_LIMIT": "Transaction exceeds the exchange's withdraw limit",
        "API_CALL_LIMIT": "Exceeded third party (e.g. exchange) API call limit",
        "ADDRESS_NOT_WHITELISTED": "Attempt to withdraw from an exchange to a non whitelisted address",
        "TIMEOUT": "The transaction request has timed out",
        "CONNECTIVITY_ERROR": "Network error",
        "THIRD_PARTY_INTERNAL_ERROR": "Received an internal error response from a third party service",
        "CANCELLED_EXTERNALLY": "Transaction was canceled by a third party service",
        "INVALID_THIRD_PARTY_RESPONSE": "Unrecognized third party response",
        "VAULT_WALLET_NOT_READY": "Vault wallet is not ready",
        "MISSING_DEPOSIT_ADDRESS": "Could not retrieve a deposit address from the exchange",
        "ONE_TIME_ADDRESS_DISABLED": "Transfering to non-whitelisted addresses is disabled in your workspace.",
        "INTERNAL_ERROR": "Internal error while processing the transaction",
        "UNKNOWN_ERROR": "Unexpected error",
        "AUTHORIZER_NOT_FOUND": "No authorizer found to approve the operation or the only authorizer found is the initiator",
        "INSUFFICIENT_RESERVED_FUNDING": "Some assets require a minimum of reserved funds being kept on the account",
        "MANUAL_DEPOSIT_ADDRESS_REQUIRED": "Error while retrieving a deposit address from an exchange. Please generate a deposit address for your exchange account",
        "INVALID_FEE": "Transaction fee is not in the allowed range",
        "ERROR_UNSUPPORTED_TRANSACTION_TYPE": "Attempt to execute an unsupported transaction Type",
        "UNSUPPORTED_OPERATION": "Unsupported operation",
        "3RD_PARTY_PROCESSING": "The transaction is pending approval by the 3rd party service (e.g exchange)",
        "PENDING_BLOCKCHAIN_CONFIRMATIONS": "Pending Blockchain confirmations",
        "3RD_PARTY_CONFIRMING": "Pending confirmation on the exchange",
        "CONFIRMED": "Confirmed on the blockchain",
        "3RD_PARTY_COMPLETED": "Completed on the 3rd party service (e.g exchange)",
        "REJECTED_BY_USER": "The transaction was rejected by one of the signers",
        "CANCELLED_BY_USER": "The transaction was canceled via the Console or the API",
        "3RD_PARTY_CANCELLED": "Cancelled on the exchange",
        "3RD_PARTY_REJECTED": "Rejected or not approved in time by user",
        "REJECTED_AML_SCREENING": "Rejected on AML Screening",
        "BLOCKED_BY_POLICY": "Transaction is blocked due to a policy rule",
        "FAILED_AML_SCREENING": "AML screening failed",
        "PARTIALLY_FAILED": "Only for Aggregated transactions. One or more of the associated transaction records failed",
        "3RD_PARTY_FAILED": "Transaction failed at the exchange",
        "DROPPED_BY_BLOCKCHAIN": "The transaction was replaced by another transaction with higher fee",
        "REJECTED_BY_BLOCKCHAIN": "Transaction was rejected by the Blockchain due to too low fees, bad inputs or bad nonce",
        "INVALID_FEE_PARAMS": "Fee parameters are inconsistent or unknown.",
        "MISSING_TAG_OR_MEMO": "A tag or memo is required to send funds to a third party address, including all exchanges.",
        "SIGNING_ERROR": "The transaction signing failed, resubmit the transaction to sign again.",
        "GAS_LIMIT_TOO_LOW": "The transaction was rejected because the gas limit was set too low",
        "TOO_MANY_INPUTS": "The transaction includes more inputs than the allowed limit (only for UTXO based blockchains)",
        "MAX_FEE_EXCEEDED": "Gas price is currently above selected max fee",
        "ACTUAL_FEE_TOO_HIGH": "Chosen fee is below current price",
        "INVALID_CONTRACT_CALL_DATA": "Transaction data was not encoded properly",
        "INVALID_NONCE_TOO_LOW": "Illegal nonce",
        "INVALID_NONCE_TOO_HIGH": "Illegal nonce",
        "INVALID_NONCE_FOR_RBF": "No matching nonce",
        "FAIL_ON_LOW_FEE": "Current blockchain fee is higher than selected",
        "TOO_LONG_MEMPOOL_CHAIN": "Too many unconfirmed transactions from this address",
        "TX_OUTDATED": "Nonce already used",
        "INCOMPLETE_USER_SETUP": "MPC setup was not completed",
        "SIGNER_NOT_FOUND": "Signer not found",
        "INVALID_TAG_OR_MEMO": "Invalid Tag or Memo",
        "ZERO_BALANCE_IN_PERMANENT_ADDRESS": "Not enough BTC on legacy permanent address",
        "NEED_MORE_TO_CREATE_DESTINATION": "Insufficient funds for creating destination account",
        "NON_EXISTING_ACCOUNT_NAME": "Account does not exist",
        "ENV_UNSUPPORTED_ASSET": "Asset is not supported under this workspace settings"
    }

    return statusToDescriptionMap[subStatus];
}

export function typecheck(v: any, type: string) {
    if (typeof v !== type) {
        throw `Invalid type, expected ${type} got ${typeof v}`;
    }
}
