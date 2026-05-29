import blessed from 'blessed';

export function createStatusBar(parent: blessed.Widgets.Node) {
  return blessed.box({
    parent,
    bottom: 0,
    left: 0,
    height: 3,
    width: '100%',
    border: 'line',
    tags: true,
    content:
      ' {cyan-fg}↑↓{/cyan-fg} Navigate  {cyan-fg}Enter{/cyan-fg} Select  {cyan-fg}Tab{/cyan-fg} Fields  {cyan-fg}E{/cyan-fg} Export  {cyan-fg}?{/cyan-fg} Help  {cyan-fg}Q{/cyan-fg} Quit ',
    style: {
      border: { fg: 'cyan' },
      fg: 'white',
    },
  });
}
