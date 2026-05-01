/**
 * PixService — gera payload BR Code (Pix) e QR code data URL.
 *
 * Implementa o EMV QR Code (BR Code) conforme Manual BACEN.
 * Em produção, a chave Pix viria do gateway (CCBill/SegPay/Pagar.me).
 *
 * SECURITY: O CRC16-CCITT do payload é calculado para que o QR seja válido.
 * Em prod, valide e armazene o txid retornado pelo gateway.
 */
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { randomUUID } from 'node:crypto';

interface PixPayload {
  amount: number;
  description: string;
  txid: string;
}

@Injectable()
export class PixService {
  private readonly receiverName = (process.env.PIX_RECEIVER_NAME ?? 'FANTASTIC').slice(0, 25);
  private readonly receiverCity = (process.env.PIX_RECEIVER_CITY ?? 'SAO PAULO').slice(0, 15);
  private readonly pixKey       = process.env.PIX_KEY ?? 'fantastic@pix.local';

  async generatePix(input: PixPayload): Promise<{ payload: string; qrCodeDataUrl: string; txid: string }> {
    const txid = input.txid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || this.shortId();
    const payload = this.buildBRCode({ ...input, txid });
    const qrCodeDataUrl = await QRCode.toDataURL(payload, {
      width: 600,
      margin: 1,
      color: { dark: '#111111', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
    return { payload, qrCodeDataUrl, txid };
  }

  private shortId(): string {
    return randomUUID().replace(/-/g, '').slice(0, 25);
  }

  /**
   * Monta o BR Code EMVCo + Pix conforme spec BACEN.
   * Sequência de campos TLV (Tag-Length-Value).
   */
  private buildBRCode({ amount, description, txid }: PixPayload): string {
    const merchantAccountInfo = this.field('00', 'BR.GOV.BCB.PIX')
      + this.field('01', this.pixKey)
      + (description ? this.field('02', description.slice(0, 60)) : '');

    const additionalData = this.field('05', txid);

    const partial =
      this.field('00', '01') +                       // Payload Format Indicator
      this.field('01', '11') +                       // Point of Initiation Method (11 = único)
      this.field('26', merchantAccountInfo) +        // Merchant Account Info (Pix)
      this.field('52', '0000') +                     // MCC
      this.field('53', '986') +                      // Currency BRL
      this.field('54', amount.toFixed(2)) +          // Amount
      this.field('58', 'BR') +                       // Country
      this.field('59', this.receiverName) +          // Receiver name
      this.field('60', this.receiverCity) +          // City
      this.field('62', additionalData);              // Additional data (txid)

    const toCrc = partial + '6304';
    const crc = this.crc16(toCrc).toString(16).toUpperCase().padStart(4, '0');
    return toCrc + crc;
  }

  private field(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  /** CRC16-CCITT-FALSE polinômio 0x1021, init 0xFFFF. */
  private crc16(payload: string): number {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xffff;
      }
    }
    return crc;
  }
}
