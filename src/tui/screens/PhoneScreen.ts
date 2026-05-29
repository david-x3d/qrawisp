import { phonePayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const PhoneScreen: ScreenDefinition = {
  id: 'phone',
  title: 'Phone',
  fields: [{ key: 'phone', label: 'Phone', kind: 'text' }],
  buildPayload: (values) => phonePayload(String(values.phone ?? '')),
};
