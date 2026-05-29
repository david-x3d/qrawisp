import fs from 'fs-extra';
import { generatePngBuffer, type QrOptions } from '../qr/generate.js';

export async function exportPng(
  payload: string,
  output: string,
  options: QrOptions = {},
): Promise<void> {
  await fs.outputFile(output, await generatePngBuffer(payload, options));
}
