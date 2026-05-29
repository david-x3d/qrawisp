import blessed from 'blessed';

export function createRoot() {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    title: 'Qrawisp',
  });

  const root = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    tags: true,
    style: { bg: 'black', fg: 'white' },
  });

  blessed.box({
    parent: root,
    top: 0,
    left: 0,
    height: 4,
    width: '100%',
    border: 'line',
    tags: true,
    content:
      ' {bold}{cyan-fg}Qrawisp{/cyan-fg}{/bold}  [ WiFi ] [ Clipboard ] [ URL ] [ Text ] [ Contact ]     Fast QR codes from your terminal.',
    style: {
      border: { fg: 'cyan' },
      fg: 'white',
    },
  });

  return { screen, root };
}
