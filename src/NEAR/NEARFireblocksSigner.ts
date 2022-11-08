import { FireblocksSDK, PeerType, PublicKeyInfoForVaultAccountArgs, PublicKeyResonse, TransactionArguments, TransactionOperation } from 'fireblocks-sdk';
import { Signer } from 'near-api-js';
import { PublicKey, Signature } from 'near-api-js/lib/utils/key_pair';
import { encode } from 'bs58';
import { sha256 } from 'js-sha256';
import { inspect } from 'util';
import { Staker } from '../Staker';

export default class NEARFireblocksSigner extends Signer {

    private static readonly EXPECTED_ALGORITHM: string = 'MPC_EDDSA_ED25519';

    private publicKey: PublicKey | undefined;

    constructor(private fbks: FireblocksSDK, private vaultAccountId: number, private staker: Staker, private assetId: string) {
        super();
    }

    async setup() {
        const pubKeyArgs: PublicKeyInfoForVaultAccountArgs = {
            assetId: this.assetId,
            vaultAccountId: this.vaultAccountId,
            change: 0,
            addressIndex: 0
        }
        let pubKeyResponse: PublicKeyResonse = await this.fbks.getPublicKeyInfoForVaultAccount(pubKeyArgs);
        if (pubKeyResponse.algorithm !== NEARFireblocksSigner.EXPECTED_ALGORITHM) {
            throw new Error(`Expected algorithm is not ${NEARFireblocksSigner.EXPECTED_ALGORITHM}.`);
        }

        this.publicKey = PublicKey.from(encode(Buffer.from(pubKeyResponse.publicKey, 'hex')));
    }

    createKey(accountId: string, networkId?: string): Promise<PublicKey> {
        throw new Error('Create key is not supported as part of this SDK, this should be done via the UI.');
    }
    getPublicKey(accountId?: string, networkId?: string): Promise<PublicKey> {
        return new Promise((resolve) => {
            resolve(this.publicKey);
        });
    }
    async signMessage(message: Uint8Array, accountId?: string, networkId?: string): Promise<Signature> {
        const msgBuffer = Buffer.from(message);
        const msgHash = sha256.create().update(msgBuffer).hex();

        let txPayload: TransactionArguments = {
            assetId: this.assetId,
            source: {
                type: PeerType.VAULT_ACCOUNT,
                id: "" + this.vaultAccountId
            },
            operation: TransactionOperation.RAW,
            extraParameters: {
                rawMessageData: {
                    messages:   [
                        {
                            content: msgHash
                        }
                    ]
                }
            }
        };

        this.staker.log(`Going to send Tx payload:\n${inspect(txPayload, false, null, true)}`);
        let txId: string = await this.staker.issueTx(txPayload);

        let tx = await this.fbks.getTransactionById(txId);

        let msgSignature = tx.signedMessages[0].signature.fullSig
        let pubkey = await this.getPublicKey();

        return new Promise((resolve) => {
            resolve({
                signature: Buffer.from(msgSignature, 'hex'),
                publicKey: pubkey
            });
        });
    }


}