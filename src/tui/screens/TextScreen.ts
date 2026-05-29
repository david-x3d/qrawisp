import { textPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const TextScreen: ScreenDefinition = {
  id: 'text',
  title: 'Text',
  fields: [
    { key: 'text', label: 'Text', kind: 'text', value: 'Fast QR codes from your terminal.' },
  ],
  buildPayload: (values) => textPayload(String(values.text ?? '')),
};
