import { urlPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const UrlScreen: ScreenDefinition = {
  id: 'url',
  title: 'URL',
  fields: [{ key: 'url', label: 'URL', kind: 'text', value: 'https://example.com' }],
  buildPayload: (values) => urlPayload(String(values.url ?? '')),
};
