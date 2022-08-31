## Fireblocks Staking SDK

### About
This repository contains a Javascript \ Typescript implementation of Fireblocks Staking SDK.
Currently supported Blockchains as part of this SDK:
- MATIC - https://polygon.technology/


## Usage
### Prerequisites
- Credentials for Fireblocks API Services. Otherwise, please contact Fireblocks support for further instructions on how to obtain your API credentials.

### CLI Usage
For ease of use we provide a CLI client that can be used with the same functionality as the SDK itself.<br>
The work done by the CLI is the same as done by creating and running stakers manually.<br>

#### Storing data
You can use a .ENV file to store some of the below values to make initializing the client a quicker process;
| Variable Name            | What it is used for                                            | Type of input or available values                    |
|--------------------------|----------------------------------------------------------------|------------------------------------------------------|
| STAKING_API_FILE_PATH    | The path to the API Key file that is used to sign API Requests | Absolute path (/path/to/file/...) in the file system |
| STAKING_API_UUID         | The API Key, can be obtained from the console                  | UUID                                                 |
| STAKING_TARGET_CHAIN     | The chain on which the staking should be performed             | One of (case sensetive): MATIC         |
| STAKING_VAULT_ACCOUNT_ID | The vault account Id from which the staking will occur         | A non-negative integer                               |

#### Using the CLI
To run the CLI run the following command from the location of the CLI:<br>
`npx ts-node CLI.ts`

And then simply follow the on-screen instructions.

### Staker usage
Each staker contains the same fundimental functionality with several functions that are callable, note each staker implementation might have slightly different implementation on this base template.

Constructor:<br>
Each Staker has the same base constructor, but can expand on it:
- fbks            - The FireblocksSDK instance to use.
- vaultAccountId  - The ID of the vault account to use.
- assetId         - Dictated by the staker (not part of instantiation by the user).
- web3            - A web3 instance for the blockchain if needed.

Core Functions:
1. stake(number)        - stake the given amount.
2. restake()            - restake the accomulated rewards.
3. unstake(number)      - unstake the given amount.
4. withdraw(number)     - withdraw the specified amount (if applicable). 
5. claimRewards()       - claims all accumulated rewards (if applicable).
6. getBalances(bool)    - returns the balances you have staked in the blockchain (bool determines if it's the smallest denominator).

Misc Functions:
1. setup()              - Validates user input and collects needed information for the staker to work properly. This should be run right after instantiating the staker.
2. runSetupIfNeeded()   - Runs the setup function if needed (each staker has different criteria to when to run the setup function).

Misc Capabilities:
1. This SDK contains logging functionality which will print information to the screen which can be helpful with understanding what's happening, or other important information. This can be turned off using:

    `Staker.logging = false;`

Each staker will have its own documentation elaborating its usage in the examples folder.
