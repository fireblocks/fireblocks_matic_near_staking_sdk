## MATIC Staking
### Prerequisites 
To be able to stake with MATIC the following is required:
1. Funds:
    1. ERC20 MATIC tokens to stake.
    2. ETH to cover TX Fees.
2. TAP (Transaction Authorization Policy) Rules (can be united):
    1. A rule to allow Contract calls to: 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0.
    2. A rule to allow Contract calls to the address of the validator that you will be using.
3. Whitelisted Address:
    1. 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0 - The address of the MATIC ERC20 token, used to call the `approve` contract call to allow for funds to be withdrawn from the account.
    2. Your validator contract address - The address with which you will be running the staking contract calls.


### General Information
1. MATIC allows for staking on Ethereum via a SmartContract, thus staking does not require raw signing. With that being said, the addresses of the MATIC Token Contract and your relevant validator contract address need to be whitelisted:<br> - MATIC Token Contract - 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0<br>All external wallets for matic staking must be of the ETH asset.
   
2. Staking is a two function call process:<br>- *approve* - approves the usage of X amount of MATIC from your wallet. The approved address is the MATIC Proof of stake contract address (0x5e3ef299fddf15eaa0432e6e66473ace8c13d908).<br>- *buyVoucher* - uses Y amount of MATIC to perform a delegation. As part of this you will recieve Z amount of tokens from the validator which can be later exchanged back for the original stake.

3. Unstaking is a singular operation in which you sell the vouchers that you bought in the staking.<br>
   Once sold, it will take 82 epochs until you can withdraw it, this is roughly 7 days (official documentation says [9 days](https://docs.polygon.technology/docs/maintain/delegate/delegator-faq/#what-is-the-unbonding-period)).<br>
   **Note** - you will receive your accumulated rewards once you perform the unstake operation.

4. Withdrawing on MATIC works by nonce.<br>
A nonce is created every time that an unstake operation is requested, each nonce is associated with the source address and contains the information relevant for the corresponding unstake.<br>
Please see the "Unique Functions" section below.

### Constructor Arguments
- `MATICStaker(fbks, vaultAccountId, validatorId, web3)`

  | Argument       | Required | Default Value        | Description                                                                                                                                   |
  |----------------|----------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
  | fbks           | ✅        | -                    | a [Fireblocks SDK](https://github.com/fireblocks/fireblocks-sdk-js) instance.                                                                 |
  | vaultAccountId | ✅        | -                    | the vault account Id from which to perform the staking.                                                                                       |
  | validatorId    | ❌        | 87                   | the Id of the validator to use. If none is specified then 87 is used which is the validator Id for [Figment](https://www.figment.io/staking). |
  | web3           | ❌        | Web 3 with MATIC RPC | a web3 instance to use within the stake.  

### Standard Function Signatures
- `stake(amount: number, approveAmount: number = -1, skipApprove: boolean = false, skipBuyVoucher: boolean = false)`:
  - amount: Amount of MATIC token to stake.
  - approveAmount: Amount of MATIC to approve to be used by the POS Contract. -1 will approve the same value as the amount parameter.
  - skipApprove: Should skip the approve call.
  - skipBuyVoucher: Should skip the buyVoucher call.
  - *Note* - skipApprove and skipBuyVoucher can't be both enabled.

- `unstake(amount: number, sharesToBurn: number = -1)`:
  - amount: Amount of MATIC token to unstake.
  - sharesToBurn: The amount of the stake tokens to burn, recommended to leave as -1

- `withdraw(nonce: number)`:
  - nonce: the nonce for the tokens you want to withdraw.

- `getBalances(smallestDenom: boolean = true): Promise<number[]>` - Returns an array of values corresponding to the values staked and rewards available. [0] = staked , [1] = reward, [2] = total (reward + stake):
  - smallestDenom: should the returned value be in the smallest denominator.


### Unique Function Signatures
- `canWithdrawStakes(): Promise<number[]>` -  Returns a number array which contains all the nonces that can be withdrawn (i.e. 82 epochs have passed since the unstake call).

- `getValidatorContract(validatorId: number): Promise<string>` - Returns the address of the validator according to their validator Id.

### Custom Validators
As part of our partnership with Blockdaemon and Figment we offer their validators as part of the SDK, requiring no further work from your side.
In the case you would like to use a different validator provider you will need to acquire the validator's ID from either the validator provider or from Polygon's site.

Getting the validator's Id:
1. Go to [polygon's staking site](https://wallet.polygon.technology/staking/validators) and look for your validator's name.
2. Click on the validator's name, this will take you to a different page with validator's details. In the URL, you will see the Id.

**For example:**<br>
Searching for "Mind Heart Soul" validator and clicking on the name will redirect you to https://wallet.polygon.technology/staking/validators/41<br>
This means that the Id for "Mind Hear Soul" is 41.