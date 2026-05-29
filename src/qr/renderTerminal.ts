import QRCode from 'qrcode';

export async function renderTerminal(payload: string, margin = 2): Promise<string> {
  return QRCode.toString(payload, {
    type: 'terminal',
    margin,
    errorCorrectionLevel: 'M',
  });
}
