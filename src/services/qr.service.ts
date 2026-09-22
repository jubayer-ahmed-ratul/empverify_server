import QRCode from 'qrcode';
import { generateVerificationToken } from '../utils/generateToken';
import { env } from '../config/env';

export interface QRCodeData {
  verificationToken: string;
  verificationUrl: string;
  qrCodeDataUrl: string;
}

export class QRService {
  async generateQRCode(): Promise<QRCodeData> {
    const verificationToken = generateVerificationToken();
    const verificationUrl = `${env.APP_URL}/verify/${verificationToken}`;

    // Generate high-quality QR code suitable for printing
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      verificationToken,
      verificationUrl,
      qrCodeDataUrl,
    };
  }

  async generateQRCodeSVG(verificationToken: string): Promise<string> {
    const verificationUrl = `${env.APP_URL}/verify/${verificationToken}`;

    return await QRCode.toString(verificationUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
    });
  }
}

export const qrService = new QRService();
