import { FireblocksSDK, VaultAccountResponse } from 'fireblocks-sdk';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as readline from 'readline';
import { inspect } from 'util';
import Web3 from 'web3';
import { Constants, MATICStaker, NEARStaker, Staker } from './src/Staking';
import * as dotenv from 'dotenv';

const yesNoResponses = ["y", "yes", "Y", "n", "no", "N"];
const yesResponses = ["y", "yes", "Y"];
const httpsRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)$/
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

type ArgumentFetcherFunction = (staker: Staker, rl: readline.Interface) => Promise<any[]>;
type DisplayFunction = (staker: Staker, values: any[]) => void;

interface FuncDescriptor {
    displayName: string;
    internalFunc: Function;
    isDisplay: boolean;
    argFunc: ArgumentFetcherFunction;
    displayFunc?: DisplayFunction;
    isExit?: boolean;
}

interface PreparedStaker {
    staker: Staker;
    funcDescriptors: FuncDescriptor[];
}

interface StakerConstructionArguments {
    fbks: FireblocksSDK;
    vaultAccountId: number;
    stakerType: string
}

async function banner(){
    //console.clear();
    console.log(
        "=================================================\n" +
        "======= Fireblocks Staking SDK CLI Client =======\n" +
        "=================================================\n"
    );
}


/**
 * Promisify the question function in readline.
 */
async function question(rl: readline.Interface, query: string): Promise<string> {
    return new Promise((resolve) => {
        console.log(query);
        rl.question("", resolve);
    })
}

async function postStakerSelection(rl:readline.Interface, staker: number | string){
    if([1, "1", "MATIC"].includes(staker)){
        console.log("Available operations:\n1. Find validator contract according to validator Id\n2. Proceed with staker configuration");
        let selection = await getAndValidateInput(
            rl, 
            "Please select the wanted operation.",
            "[ERR] Selected operation is invalid, please try again.",
            (x: string | number) => (x as number) <= 2 && (x as number) >= 1,
            true
        );

        if(selection === 2){
            return;
        }

        let validatorId = await getAndValidateInput(
            rl, 
            "Please provide the validator Id.",
            "[ERR] Validator Id is invalid, please try again.",
            (x: string | number) => (x as number) > 0,
            true
        );

        let ethWeb3 = new Web3('https://cloudflare-eth.com');
        let stakingInfoContract = new ethWeb3.eth.Contract([{ "constant": true, "inputs": [{ "internalType": "uint256", "name": "validatorId", "type": "uint256" }], "name": "getValidatorContractAddress", "outputs": [{ "internalType": "address", "name": "ValidatorContract", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }], '0xa59C847Bd5aC0172Ff4FE912C5d29E5A71A7512B');
        let contractAddress = await stakingInfoContract.methods.getValidatorContractAddress(validatorId).call();
        console.log(`Contract address to whitelist is ${contractAddress}.`);
        await postStakerSelection(rl, staker);
    }
}

/**
 * Gets the basic information required for the SDK to operate.
 */
async function intro(rl: readline.Interface): Promise<StakerConstructionArguments> {

    banner();

    let apiPrivateKeyPath = await getAndValidateInput(
            rl,
            "Please provide absolute path of the API key.",
            '[ERR] Path for API Key doesn\'t exist, please try again.',
            (x: string | number) => existsSync(x as string),
            false,
            "STAKING_API_FILE_PATH"
        );    

    let apiKey: string = await getAndValidateInput(
        rl,
        "Please provide your API user UID.",
        '[ERR] Invalid UUID Format, please try again.',
        (x: string | number) => uuidRegex.test(x as string),
        false,
        "STAKING_API_UUID"
    );

    if(!process.env.STAKING_TARGET_CHAIN)
        console.log(
            "Please select the relevant blockchain:\n" +
            "1) MATIC\n" +
            "2) NEAR\n"

        );

    let stakerTypes = ["MATIC", "NEAR", "1", "2"];
    let stakerType = await getAndValidateInput(
        rl,
        "Please insert he number or name of your staker.",
        '[ERR] Invalid selection, please try again.',
        (x: string | number) => stakerTypes.includes(x as string),
        false,
        "STAKING_TARGET_CHAIN"
    );

    await postStakerSelection(rl, stakerType);

    console.log('Validating inputs...');
    const fbks = new FireblocksSDK(readFileSync(resolve(apiPrivateKeyPath), "utf8"), apiKey);

    let accounts: VaultAccountResponse[];
    try {
        accounts = await fbks.getVaultAccounts();
    } catch {
        let pagedResponse = await fbks.getVaultAccountsWithPageInfo({ limit: 500 });
        accounts = pagedResponse.accounts;
    }

    let vaultAccountId: number = await getAndValidateInput(
        rl,
        "Please insert the vault account Id to use.",
        '[ERR] Invalid vault account id, please try again.',
        (x: string | number) => (x as number) >= 0 && (x as number) < accounts.length,
        true,
        "STAKING_VAULT_ACCOUNT_ID"
    );


    return new Promise((resolve) => {
        resolve({
            fbks: fbks,
            vaultAccountId: vaultAccountId,
            stakerType: stakerType
        });
    })
}

/**
 * Builds the needed staker according to the user's input, this will also query additional information if required.
 */
async function buildStaker(stakerType: string, fbks: FireblocksSDK, vaultAccountId: number, rl: readline.Interface): Promise<PreparedStaker> {

    let staker: MATICStaker | NEARStaker;
    let validatorId: number;

    if (["1", "MATIC"].includes(stakerType)) {
        validatorId = await getAndValidateInput(
            rl,
            'Please provide the validator\'s Id',
            '[ERR] Validator Id is invalid, please try again.',
            (x: string | number) => x > 0,
            true
        );

        staker = new MATICStaker(fbks, vaultAccountId, validatorId);
    } else {
        let testnet: string = await getAndValidateInput(
            rl,
            "Do you want to use testnet? [y/N]",
            "[ERR] Invalid input, please try again.",
            (x: string | number) => yesNoResponses.includes(x as string),
            false
        );
        let useTestnet = yesResponses.includes(testnet);
        let address = await question(rl, "Which address do you want to use? Leave blank for Figment.");
        if (address !== ""){
            staker = new NEARStaker(fbks, vaultAccountId, address, useTestnet);
        } else {
            staker = new NEARStaker(fbks, vaultAccountId, Constants.NEAR.FIGMENT_CONTRACT_ADDRESS, useTestnet);
        }
    }

    console.log('Running staker setup.');
    await staker.setup();

    console.log('Constructing internal API bridge.');
    let funcDescriptors: FuncDescriptor[] = buildFuncDescriptors(staker);

    return new Promise((resolve) => {
        resolve({
            staker: staker,
            funcDescriptors: funcDescriptors
        });
    })

}

function buildFuncDescriptors(staker: MATICStaker | NEARStaker): FuncDescriptor[] {

    let funcDescriptors: FuncDescriptor[] = [];

    // Build the argument fetcher functions used to get the arguments for the function calls.
    const stakeArgsFunc: ArgumentFetcherFunction = async (staker: Staker, rl: readline.Interface) => {
        let amountToStake: number = await getAndValidateInput(
            rl,
            'Please provide the amount you would like to stake.',
            '[ERR] Invalid amount to stake, please try again.',
            (x: string | number) => x > 0,
            true
        );

        if (staker instanceof MATICStaker) {
            let amountToApprove: number = await getAndValidateInput(
                rl,
                'Please provide the amount you would like to approve for transfer, -1 for the same amount as staked.',
                '[ERR] Invalid amount to approve, please try again.',
                (x: string | number) => (x as number) === -1 || (x as number) >= 0,
                true
            );

            let shouldSkipApprove: string = await getAndValidateInput(
                rl,
                'Please specify if you want to skip the approve call.',
                '[ERR] Invalid seletion, please try again.',
                (x: string | number) => ["y", "yes", "Y", "n", "no", "N"].includes(x as string),
                false
            );

            let shouldSkipBuyVoucher: string = await getAndValidateInput(
                rl,
                'Please specify if you want to skip the buyVoucher call (the actual staking call).',
                '[ERR] Invalid seletion, please try again.',
                (x: string | number) => ["y", "yes", "Y", "n", "no", "N"].includes(x as string),
                false
            );

            return new Promise((resolve) => {
                resolve([amountToStake, amountToApprove, yesResponses.includes(shouldSkipApprove), yesResponses.includes(shouldSkipBuyVoucher)]);
            })
        }

        return new Promise((resolve) => {
            resolve([amountToStake]);
        });
    }
    const emptyArgsFunc: ArgumentFetcherFunction = async (staker: Staker, rl: readline.Interface) => {
        return new Promise((resolve) => {
            resolve([])
        });
    }
    const getBalancesArgsFunc: ArgumentFetcherFunction = async (staker: Staker, rl: readline.Interface) => {
        let shouldBeInWei = await getAndValidateInput(
            rl,
            'Should result be in the smallest denominator of the token? [y/N]',
            '[ERR] Invalid selection, please try again.',
            (x: string | number) => ["y", "yes", "Y", "n", "no", "N"].includes(x as string),
            false
        );

        return new Promise((resolve) => {
            resolve([yesResponses.includes(shouldBeInWei)]);
        });
    }
    const unstakeArgsFunc: ArgumentFetcherFunction = async (staker: Staker, rl: readline.Interface) => {
        let unstakeAmount: number = await getAndValidateInput(
            rl,
            'Please provide amount to unstake (-1 to unstake all available staked tokens).',
            '[ERR] Invalid amount to unstake, please try again.',
            (x: string | number) => x > 0,
            true
        );

        if (staker instanceof MATICStaker) {
            let burnStakeAmount = await getAndValidateInput(
                rl,
                'Please provide minimal amount of shares to burn (recommended to set to -1 for the same amount as the unstake amount).',
                '[ERR] Invalid amount, please try again.',
                (x: string | number) => x > 0 || x === -1,
                true
            );

            return new Promise((resolve) => {
                resolve([unstakeAmount, burnStakeAmount]);
            });
        }

        return new Promise((resolve) => {
            resolve([unstakeAmount]);
        });
    }
    const withdrawArgsFunc: ArgumentFetcherFunction = async (staker: Staker, rl: readline.Interface) => {
        let query = (staker instanceof MATICStaker) ? "Please provide the nonce to withdraw." :
                "Please provide the amount to withdraw.";

        let errMessage = (staker instanceof MATICStaker) ? "[ERR] Invalid nonce, please try again." :
                "[ERR] Invalid amount to withdraw, please try again.";

        let amountToWithdraw: number = await getAndValidateInput(
            rl,
            query,
            errMessage,
            (x: string | number) => x >= 0,
            true
        );

        return new Promise((resolve) => {
            resolve([amountToWithdraw]);
        });
    }

    // Build the display functions for functions that are supposed to display data.
    const getBalancesDisplayFunc: DisplayFunction = (staker: Staker, values: any[]) => {
        if (!values || values.length !== 3) {
            if(!(staker instanceof NEARStaker && values.length == 1)){
                console.log(`[ERR] Invalid response from getBalances, must be at least 3 results (or 1 in case of NEAR Staker) - ${values.length} - ${staker instanceof NEARStaker}`);
                return;
            }
        }
        let res:any;
        if (staker instanceof NEARStaker){
            res = {
                'Total': values[0],
            };
        } else {
            res = {
                'Total': values[0],
                'Staked': values[1],
                'Rewards': values[2]
            };
        }

        console.log(inspect(res, false, null, true));
    }

    // Build the actual function descriptors.
    let stake: FuncDescriptor = {
        displayName: "Stake",
        internalFunc: staker.stake,
        isDisplay: false,
        argFunc: stakeArgsFunc
    }

    let restake: FuncDescriptor = {
        displayName: "Stake Accumulated Rewards",
        internalFunc: staker.restake,
        isDisplay: false,
        argFunc: emptyArgsFunc
    }

    let getBalances: FuncDescriptor = {
        displayName: "Get Balances",
        internalFunc: staker.getBalances,
        isDisplay: true,
        argFunc: getBalancesArgsFunc,
        displayFunc: getBalancesDisplayFunc
    }

    let unstake: FuncDescriptor = {
        displayName: "Unstake",
        internalFunc: staker.unstake,
        isDisplay: false,
        argFunc: unstakeArgsFunc
    }

    let withdraw: FuncDescriptor = {
        displayName: "Withdraw",
        internalFunc: staker.withdraw,
        isDisplay: false,
        argFunc: withdrawArgsFunc
    }

    let claimRewards: FuncDescriptor = {
        displayName: "Claim Rewards",
        internalFunc: staker.claimRewards,
        isDisplay: false,
        argFunc: emptyArgsFunc
    }

    funcDescriptors.push(
        stake,
        restake,
        unstake,
        withdraw,
        getBalances,
        claimRewards
    );

    // Build class specific function descriptors.
    if (staker instanceof MATICStaker) {

        const canClaimStakesDisplayFunc: DisplayFunction = async (staker: Staker, values: any[]) => {
            if (!values) {
                console.log('[ERR] Invalid resolve from canClaimStakes.');
                return;
            }

            if (values.length === 0) {
                console.log('No stake nonces available for claiming.');
                return;
            }

            console.log(`The following nonces are available to be claimed: ${values.join(',')}.`);
        }

        let canClaimStakes: FuncDescriptor = {
            displayName: "Nonce available to claim",
            internalFunc: (staker as MATICStaker).canWithdrawStakes,
            isDisplay: true,
            argFunc: emptyArgsFunc,
            displayFunc: canClaimStakesDisplayFunc
        };

        funcDescriptors.push(canClaimStakes);

    }

    let mainMenu: FuncDescriptor = {
        displayName: "Back to main menu",
        internalFunc: function(){},
        isDisplay: false,
        argFunc: emptyArgsFunc,
        isExit: true
    };

    funcDescriptors.push(mainMenu);
    return funcDescriptors;

}

/**
 * Gets input from the user and validates it.
 * @param rl 
 * @param query The query string (what is the message to show the user).
 * @param errMessage The error message to show in case the value is invalid.
 * @param validatorFunc A function that validates whether the input is ok or not.
 * @param isNum is the return value a number or a string.
 * @returns A number or a string that is valid input.
 */
 async function getAndValidateInput(rl: readline.Interface, query: string, errMessage: string, validatorFunc: (x: string | number) => boolean, isNum: boolean, envName: string | undefined = undefined): Promise<any> {
    let answer: string = ( envName === undefined || process.env[envName as string] as string === undefined ) ? await question(rl, query) : process.env[envName as string] as string;
    let answerNum: number;

    if (isNum) {
        try {
            answerNum = Number.parseFloat(answer);
        } catch {
            answerNum = -1;
        }

        while (!validatorFunc(answerNum)) {
            console.log(errMessage);
            answer = await question(rl, query);
            try {
                answerNum = Number.parseFloat(answer);
            } catch {
                answerNum = -1;
            }
        }
        return new Promise((resolve) => { resolve(answerNum) });
    } else {
        while (!validatorFunc(answer)) {
            console.log(errMessage);
            answer = await question(rl, query);
        }

        return new Promise((resolve) => { resolve(answer) });
    }

}

async function run(input: readline.Interface) {
    let stakerConstructorArgs: StakerConstructionArguments = await intro(input);

    let fbks: FireblocksSDK = stakerConstructorArgs.fbks;
    let vaultAccountId = stakerConstructorArgs.vaultAccountId;

    let preapredStaker: PreparedStaker = await buildStaker(stakerConstructorArgs.stakerType, fbks, vaultAccountId, input);

    let staker = preapredStaker.staker;
    let funcDescriptors = preapredStaker.funcDescriptors;

    let names: string[] = [];
    funcDescriptors.forEach((x) => names.push(x.displayName));

    banner();

    let displayMessage = "Calls availables for the staker:\n" +
        names.map((x, i) => { return `${i+1}) ${x}` }).join("\n") + "\nTo exit CTRL + C";

    console.log(displayMessage);
    let selection: number = await getAndValidateInput(
        input,
        'Please select the method to run.',
        '[ERR] Invalid selection, please try again.',
        (x: string | number) => x >= 1 && x <= funcDescriptors.length,
        true
    );

    let shouldStop = false;

    while (!shouldStop) {
        banner();
        console.log("Please do not exit until the menu is shown again.");
        let descriptor = funcDescriptors[selection - 1];

        if (descriptor.isExit && descriptor.isExit === true) {
            break;
        }

        try {
            let args = await descriptor.argFunc(staker, input);
            let res: any[];    
            res = await descriptor.internalFunc.apply(staker, args);
            if (descriptor.isDisplay && descriptor.displayFunc) {
                descriptor.displayFunc(staker, res);
            }
        } catch (e) {
            console.log(`[ERR] Execution of call failed due to: ${e.message}`)
            if(process.env.STAKING_DEBUG){
                console.log(inspect(e, false,null,true));
                console.log(e.stack);
            }
        }

        console.log(displayMessage);
        selection = await getAndValidateInput(
            input,
            'Please select the method to run.',
            '[ERR] Invalid selection, please try again.',
            (x: string | number) => x >= 1 && x <= funcDescriptors.length,
            true
        );
    }

}

(async () => {

    const input = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    input.on('SIGINT', () => { input.close(); });

    dotenv.config();

    while (true) {
        await run(input);
    }

})();
