import { helpText } from '../Help.js';
import type { ScreenDefinition } from './types.js';

export const HelpScreen: ScreenDefinition = {
  id: 'help',
  title: 'Help',
  fields: [],
  note: 'Keyboard controls, privacy notes, and terminal workflow basics.',
  buildPayload: () => helpText,
};
