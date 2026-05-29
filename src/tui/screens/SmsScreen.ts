import { smsPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const SmsScreen: ScreenDefinition = {
  id: 'sms',
  title: 'SMS',
  fields: [
    { key: 'phone', label: 'Phone', kind: 'text' },
    { key: 'message', label: 'Message', kind: 'text' },
  ],
  buildPayload: (values) => smsPayload(String(values.phone ?? ''), String(values.message ?? '')),
};
