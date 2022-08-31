const { Staker } = require("../dist/Staker");

class CustomStaker extends Staker{

    /*
    The below constructor is the recommended template for constructors, but can be changed, however, be sure to run the super call as specified in this function.
    The reason for the need for super call is because some basic functionality (such as issueTx and logging) uses these values.
    <YOUR_ASSET_ID> is the asset Id from your fireblocks workspace (can be definitivley determine from UI or API).
     */
    constructor(fbks, vaultAccountId, web3/*, parameter4: type4, parameter5: type5, ... */){
        super(fbks, '<YOUR_ASSET_ID>', vaultAccountId, web3);
    }

    /*
    - In the below functions please try not to set any class-scoped usage values (such as external wallet Id).
    - There is no dependency between the functions on the SDK, so you are able to leave functions unimplemented as you see fit.
    - It is recommended that you use:
      * typecheck(value, type)     - to validate types.
      * await runSetupIfNeeded()                - to make sure all class-scoped values are defined and there is no issue with user input.
      * this.standardTx(dest, extraParameters, note, amount, operation = TransactionOperation.CONTRACT_CALL) - to generate the basic transaction payload.
      * await this.issueTx(txPayload) - to send a transaction to the fireblocks infrastructure. The returns value is the transaction id.
    - All the functions can be changed to async as needed (this is recommended).
     */

    stake(amount) {
        /**
         * Perform all the necessary calls to perform a stake operation.
         */
    }

    restake(amount) {
        /**
         * Perform all the necessary calls for a restake operation. In most POS blockchains this means that your rewarded tokens are re-inserted as new stake.
         */
    }

    getBalances(wei) {
        /**
         * Get all the balances for staked tokens and rewards accumulated.
         * Returns the balances [total, staked, rewards, other1, other2, ..]
         */
    }

    unstake(amount) {
        /**
         * Perform all the necessary calls for an unstake operation.
         */
    }

    withdraw(amount) {
        /**
         * Performs all the necessary calls for a withdraw operation.
         */
    }

    claimRewards() {
        /**
         * Performs all necessary calls to claim the accumulated rewards.
         */
    }

    /*
    - In the below methods set the values needed for class-scoped usage, like the external wallet Id for the validator.
     */
    setup() {
        /**
         * Set whatever class-scoped values you need
         */
    }
    
    runSetupIfNeeded() {
        /**
         * Define some checks that determine if the setup function was or was not run.
         */
    }

}