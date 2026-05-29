import type { ScreenDefinition } from './types.js';

export const SettingsScreen: ScreenDefinition = {
  id: 'settings',
  title: 'Settings',
  fields: [
    { key: 'margin', label: 'QR quiet-zone margin', kind: 'text', value: '4' },
    { key: 'invert', label: 'Invert export colors', kind: 'checkbox', value: false },
  ],
  buildPayload: () => 'Qrawisp settings',
};
