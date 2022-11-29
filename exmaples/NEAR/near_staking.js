const fs = require('fs');
const path = require('path');
const FireblocksSDK = require('fireblocks-sdk').FireblocksSDK;
const NEARStaker = require('fireblocks-staking-sdk').NEARStaker;

const apiSecret = "...";
const apiKey = "...";
const fbks = new FireblocksSDK(apiSecret, apiKey);

async function defaultContractUsageExample() {
    let staker = new NEARStaker(fbks, 0);
    await staker.setup();

    const amountToStake = 3;
    const amountToUnstake = 2;
    const amountToWithdraw = 1;

    // Stake some NEAR
    await staker.stake(amountToStake);

    // Get the current balance for the account.
    let balances = await staker.getBalances();
    const staked = balances[0];

    // Unstake some NEAR.
    await staker.unstake(amountToUnstake);

    // Withdraw some NEAR.
    await staker.withdraw(amountToWithdraw);
}

async function customValidatorUsage(){
    let staker = new NEARStaker(fbks, 0, 'validator.near' /* Custom validator address */);
    await staker.setup();

    // Rest if the functionality is exactly the same.
}

async function testnetUsage(){
    let staker = new NEARStaker(fbks, 0, 'validator.near', true);
    await staker.setup();

    // Rest if the functionality is exactly the same.
    // You can also define a custom config with testnet, as defined in the relevant section.
}


async function customConfigUsage(){
    const CUSTOM_NEAR_CONFIG = {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.mainnet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
        headers: {}
    };
    let staker = new NEARStaker(fbks, 0, 'validator.near', false, CUSTOM_NEAR_CONFIG);
    await staker.setup();

    // Rest if the functionality is exactly the same.
}
