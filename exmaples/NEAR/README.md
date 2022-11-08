## NEAR Staking
### Prerequisites 
To be able to stake with NEAR the following is required:
1. Funds:
    1. NEAR base asset to cover transactions and storage fees.
2. TAP (Transaction Authorization Policy) Rules (can be united):
    1. A rule to allow Contract calls to the address of the validator that you will be using.
3. Whitelisted Address:
    1. Your validator contract address - The address with which you will be running the staking contract calls.


### General Information
1. NEAR Staking is performed in a single contract call. In NEAR each address can have a single contract deployed. Each validator address will generally need to comply with [this specification](https://github.com/near/core-contracts/tree/master/staking-pool) which contains the available functions to use when staking.
   
2. The NEAR Staking SDK performs a single operation for staking, `deposit_and_stake`, which **transfers** NEAR assets from your account to the validator's address. There is no option within this SDK to only deposit or only stake.

3. There is currently no option to identify how much rewards you have accumulated.

4. Withdrawing requires an unstake operation first, followed by a cooldown period of approximately 2 days.

5. NEAR SDK (not this Staking SDK) prints recipets for transactions, these are printed to stdout (standard output, console or otherwise), make sure to save those as they have information about transactions and failures.

### Constructor Arguments
- `NEARStaker(fbks, vaultAccountId, contractName, isTestnet, config, web3)`

| Argument       | Required | Default Value       | Description                                                                                                                                                         |
|----------------|----------|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| fbks           | ✅        | -                   | A [Fireblocks SDK](https://github.com/fireblocks/fireblocks-sdk-js) instance.                                                                                       |
| vaultAccountId | ✅        | -                   | The vault account Id from which to perform the staking.                                                                                                             |
| contractName   | ❌        | figment.poolv1.near | The name of the validator to use. If none is specified then `figment.poolv1.near` is used which is the contract name for [Figment](https://www.figment.io/staking). |
| isTestnet      | ❌        | false               | Whether the staking is performed on NEAR testnet or not                                                                                                             |
| config         | ❌        | undefined           | The connection config for NEAR, if left undefined then the config that will be used is a predefined config for NEAR according to the isTestnet flag                 |
| web3           | ❌        | undefined           | Irrelevant for NEAR Staking                                                                                                                                         |

### Standard Function Signatures
- `stake(amount: number)`:
  - amount: Amount of NEAR to stake.

- `unstake(amount: number)`:
  - amount: Amount of NEAR to unstake.

- `withdraw(amount: number)`:
  - amount: Amount of NEAR to withdraw

- `getBalances(smallestDenom: boolean = true): Promise<number[]>` - Returns an array of a single value, that value is the total **staked** amount of the account


### Unique Function Signatures
NEAR Staking SDK does not contain any unique funcitons.

### Custom Validators
As part of our partnership with Blockdaemon and Figment we offer their validators as part of the SDK, requiring no further work from your side.
In the case you would like to use a different validator provider you will need to acquire the validator's contract name from the staking provider themselves.
