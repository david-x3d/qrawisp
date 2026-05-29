import { textPayload } from '../../qr/payloads.js';
import { readClipboard } from '../../clipboard/clipboard.js';
import type { ScreenDefinition } from './types.js';

export const ClipboardScreen: ScreenDefinition = {
  id: 'clipboard',
  title: 'Clipboard',
  fields: [],
  note: 'Warns when clipboard content looks sensitive or very long.',
  async buildPayload() {
    const result = await readClipboard();
    if (!result.text) throw new Error('Clipboard is empty.');
    if (result.sensitiveFindings.length) {
      throw new Error(`Clipboard looks sensitive: ${result.sensitiveFindings.join(', ')}.`);
    }
    if (result.isVeryLong) {
      throw new Error(
        'Clipboard content is very long. Use the CLI after confirming the content is safe.',
      );
    }
    return textPayload(result.text);
  },
};
