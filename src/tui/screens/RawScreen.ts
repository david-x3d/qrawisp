import { rawPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const RawScreen: ScreenDefinition = {
  id: 'raw',
  title: 'Raw Payload',
  fields: [{ key: 'payload', label: 'Payload', kind: 'text' }],
  buildPayload: (values) => rawPayload(String(values.payload ?? '')),
};
