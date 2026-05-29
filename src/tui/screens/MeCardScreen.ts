import { mecardPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const MeCardScreen: ScreenDefinition = {
  id: 'mecard',
  title: 'MeCard Contact',
  fields: [
    { key: 'name', label: 'Name', kind: 'text' },
    { key: 'phone', label: 'Phone', kind: 'text' },
    { key: 'email', label: 'Email', kind: 'text' },
    { key: 'address', label: 'Address', kind: 'text' },
    { key: 'url', label: 'URL', kind: 'text' },
    { key: 'note', label: 'Note', kind: 'text' },
  ],
  buildPayload: (values) =>
    mecardPayload({
      name: String(values.name ?? ''),
      phone: String(values.phone ?? ''),
      email: String(values.email ?? ''),
      address: String(values.address ?? ''),
      url: String(values.url ?? ''),
      note: String(values.note ?? ''),
    }),
};
