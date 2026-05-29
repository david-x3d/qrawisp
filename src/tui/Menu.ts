import blessed from 'blessed';
import type { ScreenDefinition } from './screens/types.js';

export function createMenu(parent: blessed.Widgets.Node, items: ScreenDefinition[]) {
  return blessed.list({
    parent,
    label: ' Menu ',
    top: 4,
    left: 0,
    width: 24,
    bottom: 3,
    border: 'line',
    mouse: true,
    keys: true,
    vi: true,
    style: {
      border: { fg: 'cyan' },
      selected: { bg: 'cyan', fg: 'black', bold: true },
      item: { fg: 'white' },
    },
    items: items.map((screen) => ` ${screen.title}`),
  });
}
