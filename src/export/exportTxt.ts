import fs from 'fs-extra';
import { renderTerminal } from '../qr/renderTerminal.js';

export async function exportTxt(payload: string, output: string, margin = 2): Promise<void> {
  await fs.outputFile(output, await renderTerminal(payload, margin), 'utf8');
}
