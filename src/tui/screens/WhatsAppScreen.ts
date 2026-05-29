import { whatsappPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const WhatsAppScreen: ScreenDefinition = {
  id: 'whatsapp',
  title: 'WhatsApp',
  fields: [
    { key: 'phone', label: 'Phone with country code', kind: 'text' },
    { key: 'message', label: 'Message', kind: 'text' },
  ],
  buildPayload: (values) =>
    whatsappPayload(String(values.phone ?? ''), String(values.message ?? '')),
};
