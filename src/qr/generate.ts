import QRCode from 'qrcode';

export interface QrOptions {
  margin?: number;
  size?: number;
  invert?: boolean;
}

function colors(options: QrOptions) {
  return options.invert
    ? { dark: '#ffffffff', light: '#000000ff' }
    : { dark: '#000000ff', light: '#ffffffff' };
}

export async function generatePngBuffer(payload: string, options: QrOptions = {}): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: 'png',
    width: options.size ?? 768,
    margin: options.margin ?? 4,
    color: colors(options),
    errorCorrectionLevel: 'M',
  });
}

export async function generateSvg(payload: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toString(payload, {
    type: 'svg',
    margin: options.margin ?? 4,
    color: colors(options),
    errorCorrectionLevel: 'M',
  });
}
