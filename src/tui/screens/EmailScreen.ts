import { emailPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const EmailScreen: ScreenDefinition = {
  id: 'email',
  title: 'Email',
  fields: [
    { key: 'address', label: 'Email', kind: 'text' },
    { key: 'subject', label: 'Subject', kind: 'text' },
    { key: 'body', label: 'Body', kind: 'text' },
  ],
  buildPayload: (values) =>
    emailPayload(
      String(values.address ?? ''),
      String(values.subject ?? ''),
      String(values.body ?? ''),
    ),
};
