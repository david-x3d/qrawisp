import fs from 'fs-extra';
import { generateSvg, type QrOptions } from '../qr/generate.js';

export async function exportSvg(
  payload: string,
  output: string,
  options: QrOptions = {},
): Promise<void> {
  await fs.outputFile(output, await generateSvg(payload, options), 'utf8');
}
