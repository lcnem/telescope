import { Injectable } from '@angular/core';
import { cosmosclient, rest, proto } from 'cosmos-client';
import { CosmosSDKService } from '../cosmos-sdk.service';
import { Key } from '../keys/key.model';
import { KeyService } from '../keys/key.service';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  constructor(private readonly cosmosSDK: CosmosSDKService, private readonly key: KeyService) { }

  async send(key: Key, toAddress: string, amount: proto.cosmos.base.v1beta1.ICoin[], privateKey: string) {
    const sdk = await this.cosmosSDK.sdk().then((sdk) => sdk.rest);
    const privKey = this.key.getPrivKey(key.type, privateKey);
    const pubKey = privKey.pubKey();
    const fromAddress = cosmosclient.AccAddress.fromPublicKey(pubKey);

    // get account info
    const account = await rest.cosmos.auth
      .account(sdk, fromAddress)
      .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
      .catch((_) => undefined);

    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('Address not found');
    }

    // build tx
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: fromAddress.toString(),
      to_address: toAddress,
      amount,
    });

    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgSend)],
    });
    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(pubKey),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: account.sequence,
        },
      ],
      fee: {
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    });

    // sign
    const txBuilder = new cosmosclient.TxBuilder(sdk, txBody, authInfo);
    const signDocBytes = txBuilder.signDocBytes(account.account_number);
    txBuilder.addSignature(privKey.sign(signDocBytes));

    // broadcast
    const result = await rest.cosmos.tx.broadcastTx(sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.cosmos.tx.BroadcastTxMode.Block,
    });

    return result.data.tx_response?.txhash || '';
  }
}
