import { bitcoinPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const BitcoinScreen: ScreenDefinition = {
  id: 'bitcoin',
  title: 'Bitcoin',
  fields: [
    { key: 'address', label: 'Address', kind: 'text' },
    { key: 'amount', label: 'Amount', kind: 'text' },
    { key: 'label', label: 'Label', kind: 'text' },
    { key: 'message', label: 'Message', kind: 'text' },
  ],
  buildPayload: (values) =>
    bitcoinPayload({
      address: String(values.address ?? ''),
      amount: String(values.amount ?? ''),
      label: String(values.label ?? ''),
      message: String(values.message ?? ''),
    }),
};
