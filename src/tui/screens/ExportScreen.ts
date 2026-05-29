import type { ScreenDefinition } from './types.js';

export const ExportScreen: ScreenDefinition = {
  id: 'export',
  title: 'Export Manager',
  fields: [],
  note: 'Press E from any QR screen to export the current payload as qrawisp.png.',
  buildPayload: () => 'Qrawisp export manager',
};
