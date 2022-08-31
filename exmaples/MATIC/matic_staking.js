const fs = require('fs');
const path = require('path');
const FireblocksSDK = require('fireblocks-sdk').FireblocksSDK;
const MATICStaker = require('fireblocks-staking-sdk').MATICStaker;

const apiSecret = "...";
const apiKey = "...";
const fbks = new FireblocksSDK(apiSecret, apiKey);

async function defaultContractUsageExample() {
    let staker = new MATICStaker(fbks, 0);
    await staker.setup();

    const amountToStake = 1;
    const amountToApprove = 2;
    const amountToUnstake = 3;
    const validatorId = 87;

    // Stake some MATIC
    await staker.stake(amountToStake);

    // Stake some MATIC but approve a differnet amount.
    await staker.stake(amountToStake, amountToApprove);

    // Stake some MATIC but skip the approve call.
    await staker.stake(amountToStake, -1, true);

    // Stake some MATIC but skip the buy voucher call.
    await staker.stake(amountToStake, -1, false, true);

    // Restake the rewards that were accumulated so far.
    await staker.restake();

    // Get the current balance for the account.
    let balances = await staker.getBalances();
    const staked = balances[0];
    const rewards = balances[1];
    const total = balances[2];

    // Unstake some MATIC - as mentioned in documentation it is not recommended to use the second parameter.
    await staker.unstake(amountToUnstake);

    // Check which nonces can be withdrawn.
    let nonces = await staker.canWithdrawStakes();
    console.log(`Can withdraw nonces: [${nonces.join(',')}]`);

    let validatorContract = staker.getValidatorContractAddress(validatorId);
    console.log(`The validator's ${validatorId} contract address is ${validatorContract}`);
}

async function customContractUsageExample(){
    let staker = new MATICStaker(fbks, 0, 87 /* Figment validator Id */);
    await staker.setup();

    // Rest if the functionality is exactly the same.
}