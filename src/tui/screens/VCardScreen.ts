import { vcardPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const VCardScreen: ScreenDefinition = {
  id: 'vcard',
  title: 'Contact / vCard',
  fields: [
    { key: 'name', label: 'Name', kind: 'text' },
    { key: 'phone', label: 'Phone', kind: 'text' },
    { key: 'email', label: 'Email', kind: 'text' },
    { key: 'org', label: 'Organization', kind: 'text' },
    { key: 'title', label: 'Title', kind: 'text' },
    { key: 'url', label: 'URL', kind: 'text' },
  ],
  buildPayload: (values) =>
    vcardPayload({
      name: String(values.name ?? ''),
      phone: String(values.phone ?? ''),
      email: String(values.email ?? ''),
      org: String(values.org ?? ''),
      title: String(values.title ?? ''),
      url: String(values.url ?? ''),
    }),
};
