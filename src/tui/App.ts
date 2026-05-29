import blessed from 'blessed';
import clipboard from 'clipboardy';
import { exportPng } from '../export/exportPng.js';
import { renderTerminal } from '../qr/renderTerminal.js';
import { messageFromError } from '../utils/errors.js';
import { helpText } from './Help.js';
import { createRoot } from './Layout.js';
import { createMenu } from './Menu.js';
import { createStatusBar } from './StatusBar.js';
import { screens } from './screens/index.js';
import type { FieldDefinition, ScreenDefinition } from './screens/types.js';

type FieldWidget =
  | blessed.Widgets.TextboxElement
  | blessed.Widgets.CheckboxElement
  | blessed.Widgets.ListElement;

export class App {
  private readonly blessedScreen: blessed.Widgets.Screen;
  private readonly root: blessed.Widgets.BoxElement;
  private readonly menu: blessed.Widgets.ListElement;
  private readonly panel: blessed.Widgets.BoxElement;
  private readonly preview: blessed.Widgets.BoxElement;
  private readonly payloadBox: blessed.Widgets.BoxElement;
  private readonly status: blessed.Widgets.BoxElement;
  private activeScreen: ScreenDefinition = screens[0];
  private currentPayload = '';
  private fields = new Map<string, FieldWidget>();

  constructor() {
    const { screen, root } = createRoot();
    this.blessedScreen = screen;
    this.root = root;
    this.menu = createMenu(root, screens);
    this.panel = blessed.box({
      parent: root,
      label: ' Input ',
      top: 4,
      left: 24,
      width: '38%',
      bottom: 3,
      border: 'line',
      tags: true,
      style: { border: { fg: 'cyan' }, fg: 'white' },
    });
    this.preview = blessed.box({
      parent: root,
      label: ' QR Preview ',
      top: 4,
      left: '38%+24',
      right: 0,
      bottom: 8,
      border: 'line',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      style: { border: { fg: 'cyan' }, fg: 'white' },
    });
    this.payloadBox = blessed.box({
      parent: root,
      label: ' Payload ',
      left: '38%+24',
      right: 0,
      bottom: 3,
      height: 5,
      border: 'line',
      tags: true,
      scrollable: true,
      mouse: true,
      style: { border: { fg: 'cyan' }, fg: 'white' },
    });
    this.status = createStatusBar(root);
  }

  run(): void {
    this.bindKeys();
    this.menu.select(0);
    this.menu.focus();
    this.loadScreen(screens[0]);
    this.blessedScreen.render();
  }

  private bindKeys(): void {
    this.blessedScreen.key(['q', 'escape', 'C-c'], () => process.exit(0));
    this.blessedScreen.key('?', () => this.showHelp());
    this.blessedScreen.key('e', () => void this.exportCurrent());
    this.menu.on('select', (_, index) => this.loadScreen(screens[index]));
  }

  private loadScreen(screenDefinition: ScreenDefinition): void {
    this.activeScreen = screenDefinition;
    this.fields.clear();
    this.panel.children.slice().forEach((child) => child.destroy());
    blessed.box({
      parent: this.panel,
      top: 0,
      left: 1,
      height: 2,
      tags: true,
      content: `{bold}${screenDefinition.title}{/bold}`,
    });
    if (screenDefinition.note) {
      blessed.box({
        parent: this.panel,
        top: 2,
        left: 1,
        height: 3,
        width: '95%',
        tags: true,
        content: `{yellow-fg}${screenDefinition.note}{/yellow-fg}`,
      });
    }

    let top = screenDefinition.note ? 6 : 3;
    for (const field of screenDefinition.fields) {
      this.addField(field, top);
      top += 4;
    }

    this.addActions(top + 1);
    void this.updatePreview();
  }

  private addField(field: FieldDefinition, top: number): void {
    blessed.text({
      parent: this.panel,
      top,
      left: 1,
      height: 1,
      content: field.label,
      style: { fg: 'cyan' },
    });
    if (field.kind === 'checkbox') {
      const checkbox = blessed.checkbox({
        parent: this.panel,
        top: top + 1,
        left: 2,
        height: 1,
        width: '90%',
        mouse: true,
        keys: true,
        checked: Boolean(field.value),
        content: field.label,
      });
      checkbox.on('check', () => void this.updatePreview());
      checkbox.on('uncheck', () => void this.updatePreview());
      this.fields.set(field.key, checkbox);
      return;
    }
    if (field.kind === 'select') {
      const list = blessed.list({
        parent: this.panel,
        top: top + 1,
        left: 1,
        height: Math.max(3, field.options?.length ?? 3),
        width: '90%',
        border: 'line',
        mouse: true,
        keys: true,
        items: field.options ?? [],
        style: {
          border: { fg: 'blue' },
          selected: { bg: 'cyan', fg: 'black' },
        },
      });
      list.select(Math.max(0, field.options?.indexOf(String(field.value ?? '')) ?? 0));
      list.on('select', () => void this.updatePreview());
      this.fields.set(field.key, list);
      return;
    }
    const input = blessed.textbox({
      parent: this.panel,
      top: top + 1,
      left: 1,
      height: 3,
      width: '90%',
      border: 'line',
      inputOnFocus: true,
      mouse: true,
      keys: true,
      censor: field.kind === 'password',
      value: typeof field.value === 'string' ? field.value : '',
      style: {
        border: { fg: 'blue' },
        focus: { border: { fg: 'cyan' } },
      },
    });
    input.on('keypress', () => setTimeout(() => void this.updatePreview(), 0));
    input.on('submit', () => void this.updatePreview());
    this.fields.set(field.key, input);

    if (field.kind === 'password') {
      const show = blessed.checkbox({
        parent: this.panel,
        top: top + 1,
        left: '92%',
        height: 1,
        width: 8,
        mouse: true,
        keys: true,
        content: 'show',
      });
      show.on('check', () => {
        (input.options as { censor?: boolean }).censor = false;
        this.blessedScreen.render();
      });
      show.on('uncheck', () => {
        (input.options as { censor?: boolean }).censor = true;
        this.blessedScreen.render();
      });
    }
  }

  private addActions(top: number): void {
    const generate = blessed.button({
      parent: this.panel,
      top,
      left: 1,
      height: 3,
      width: 16,
      mouse: true,
      keys: true,
      shrink: true,
      padding: { left: 1, right: 1 },
      content: 'Regenerate',
      style: { bg: 'cyan', fg: 'black', focus: { bg: 'white' } },
    });
    generate.on('press', () => void this.updatePreview());

    const copy = blessed.button({
      parent: this.panel,
      top,
      left: 20,
      height: 3,
      width: 18,
      mouse: true,
      keys: true,
      shrink: true,
      padding: { left: 1, right: 1 },
      content: 'Copy Payload',
      style: { bg: 'blue', fg: 'white', focus: { bg: 'cyan', fg: 'black' } },
    });
    copy.on('press', () => void this.copyPayload());
  }

  private readValues(): Record<string, string | boolean> {
    const values: Record<string, string | boolean> = {};
    for (const [key, widget] of this.fields) {
      if ('checked' in widget) {
        values[key] = Boolean(widget.checked);
      } else if ('ritems' in widget) {
        const list = widget as blessed.Widgets.ListElement & { ritems: string[]; selected: number };
        values[key] = String(list.ritems[list.selected] ?? '');
      } else if ('getValue' in widget) {
        values[key] = widget.getValue();
      }
    }
    return values;
  }

  private async updatePreview(): Promise<void> {
    try {
      const payload = await this.activeScreen.buildPayload(this.readValues());
      this.currentPayload = payload;
      const qr = await renderTerminal(payload, 2);
      this.preview.setContent(`\n${qr}`);
      this.payloadBox.setContent(this.maskIfNeeded(payload));
      this.setStatus('Ready');
    } catch (error) {
      this.currentPayload = '';
      this.preview.setContent(`\n{red-fg}${messageFromError(error)}{/red-fg}`);
      this.payloadBox.setContent('');
      this.setStatus(messageFromError(error), true);
    } finally {
      this.blessedScreen.render();
    }
  }

  private maskIfNeeded(payload: string): string {
    if (!payload.startsWith('WIFI:')) return payload;
    return payload.replace(/P:([^;]*)/g, 'P:********');
  }

  private async exportCurrent(): Promise<void> {
    if (!this.currentPayload) {
      this.setStatus('No QR payload is ready to export.', true);
      this.blessedScreen.render();
      return;
    }
    await exportPng(this.currentPayload, 'qrawisp.png', { margin: 4, size: 768 });
    this.setStatus('Exported qrawisp.png');
    this.blessedScreen.render();
  }

  private async copyPayload(): Promise<void> {
    if (!this.currentPayload) return;
    await clipboard.write(this.currentPayload);
    this.setStatus('Payload copied to clipboard.');
    this.blessedScreen.render();
  }

  private showHelp(): void {
    const box = blessed.message({
      parent: this.root,
      top: 'center',
      left: 'center',
      width: '70%',
      height: '70%',
      label: ' Help ',
      border: 'line',
      keys: true,
      mouse: true,
      tags: true,
      style: {
        border: { fg: 'cyan' },
        bg: 'black',
        fg: 'white',
      },
    });
    box.display(helpText, 0, () => this.blessedScreen.render());
  }

  private setStatus(message: string, isError = false): void {
    this.status.setContent(
      ` ${isError ? '{red-fg}' : '{green-fg}'}${message}{/${isError ? 'red' : 'green'}-fg}  {cyan-fg}↑↓{/cyan-fg} Navigate  {cyan-fg}Enter{/cyan-fg} Select  {cyan-fg}E{/cyan-fg} Export  {cyan-fg}Q{/cyan-fg} Quit `,
    );
  }
}

export function startTui(): void {
  new App().run();
}
