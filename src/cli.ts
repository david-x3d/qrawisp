import { Command } from 'commander';
import { exportPng } from './export/exportPng.js';
import { exportSvg } from './export/exportSvg.js';
import { exportTxt } from './export/exportTxt.js';
import { readClipboard } from './clipboard/clipboard.js';
import {
  emailPayload,
  geoPayload,
  phonePayload,
  rawPayload,
  smsPayload,
  textPayload,
  urlPayload,
  vcardPayload,
  wifiPayload,
  type WifiEncryption,
} from './qr/payloads.js';
import { renderTerminal } from './qr/renderTerminal.js';
import { startTui } from './tui/App.js';
import { detectCurrentWifi } from './wifi/detect.js';
import { messageFromError } from './utils/errors.js';
import { warn } from './utils/logger.js';

type Format = 'png' | 'svg' | 'txt';

interface GlobalOptions {
  output?: string;
  format?: Format;
  export?: Format;
  quiet?: boolean;
  showSecret?: boolean;
  noColor?: boolean;
  invert?: boolean;
  size?: string;
  margin?: string;
}

function addGlobalOptions(command: Command): Command {
  return command
    .option('-o, --output <file>', 'write QR output to a file')
    .option('--format <format>', 'output format: png, svg, txt')
    .option('--export <format>', 'alias for --format')
    .option('--quiet', 'suppress terminal QR output')
    .option('--show-secret', 'allow secret payload text to be printed where applicable')
    .option('--no-color', 'disable color output')
    .option('--invert', 'invert PNG/SVG colors')
    .option('--size <px>', 'PNG size in pixels', '768')
    .option('--margin <cells>', 'QR quiet-zone margin', '4');
}

function parseFormat(options: GlobalOptions): Format {
  const format =
    options.export ??
    options.format ??
    (options.output?.endsWith('.svg') ? 'svg' : options.output?.endsWith('.txt') ? 'txt' : 'png');
  if (!['png', 'svg', 'txt'].includes(format)) {
    throw new Error('Format must be png, svg, or txt.');
  }
  return format as Format;
}

function opts<T extends GlobalOptions>(value: Command | GlobalOptions, command?: Command): T {
  const source =
    command ?? (typeof (value as Command).opts === 'function' ? (value as Command) : undefined);
  if (source) {
    return source.optsWithGlobals<T>();
  }
  return value as T;
}

async function writePayload(
  payload: string,
  options: GlobalOptions,
  sensitive = false,
): Promise<void> {
  const margin = Number(options.margin ?? 4);
  const size = Number(options.size ?? 768);
  if (options.output) {
    const format = parseFormat(options);
    if (format === 'png')
      await exportPng(payload, options.output, { margin, size, invert: options.invert });
    if (format === 'svg')
      await exportSvg(payload, options.output, { margin, size, invert: options.invert });
    if (format === 'txt') await exportTxt(payload, options.output, margin);
  }
  if (!options.quiet) {
    process.stdout.write(`${await renderTerminal(payload, Math.min(margin, 4))}\n`);
    if (!sensitive || options.showSecret) {
      process.stdout.write(`${payload}\n`);
    }
  }
}

export function createCli(): Command {
  const program = addGlobalOptions(new Command())
    .name('qrawisp')
    .description('Fast QR codes from your terminal.')
    .action(() => startTui());

  addGlobalOptions(program.command('wifi'))
    .description('Generate a WiFi QR code, detecting the current network when no SSID is provided')
    .option('--ssid <ssid>', 'WiFi SSID')
    .option('--password <password>', 'WiFi password')
    .option('--type <type>', 'WPA, WEP, or nopass', 'WPA')
    .option('--hidden', 'mark the network as hidden')
    .action(async (optionValues: GlobalOptions, command: Command) => {
      const options = opts<
        GlobalOptions & {
          ssid?: string;
          password?: string;
          type: WifiEncryption;
          hidden?: boolean;
        }
      >(optionValues, command);
      const detected = options.ssid ? undefined : await detectCurrentWifi();
      const payload = wifiPayload({
        ssid: options.ssid ?? detected?.ssid ?? '',
        password: options.password ?? detected?.password,
        type: options.type ?? detected?.type,
        hidden: options.hidden ?? detected?.hidden ?? false,
      });
      await writePayload(payload, options, true);
    });

  addGlobalOptions(program.command('url <url>'))
    .description('Generate a URL QR code')
    .action((url: string, optionValues: GlobalOptions, command: Command) =>
      writePayload(urlPayload(url), opts(optionValues, command)),
    );

  addGlobalOptions(program.command('text <text>'))
    .description('Generate a plain text QR code')
    .action((text: string, optionValues: GlobalOptions, command: Command) =>
      writePayload(textPayload(text), opts(optionValues, command)),
    );

  addGlobalOptions(program.command('clip'))
    .description('Generate a QR code from clipboard content')
    .option('--yes', 'confirm long or sensitive clipboard content')
    .action(async (optionValues: GlobalOptions & { yes?: boolean }, command: Command) => {
      const options = opts<GlobalOptions & { yes?: boolean }>(optionValues, command);
      const result = await readClipboard();
      if (!result.text) throw new Error('Clipboard is empty.');
      if (result.sensitiveFindings.length) {
        warn(`Clipboard looks sensitive: ${result.sensitiveFindings.join(', ')}.`);
        if (!options.yes)
          throw new Error(
            'Re-run with --yes after confirming you want to encode this clipboard content.',
          );
      }
      if (result.isVeryLong && !options.yes) {
        throw new Error('Clipboard content is very long. Re-run with --yes after confirming.');
      }
      await writePayload(textPayload(result.text), options, result.sensitiveFindings.length > 0);
    });

  addGlobalOptions(program.command('email <address>'))
    .description('Generate a mailto QR code')
    .option('--subject <subject>', 'email subject')
    .option('--body <body>', 'email body')
    .action((address: string, optionValues: GlobalOptions, command: Command) => {
      const options = opts<GlobalOptions & { subject?: string; body?: string }>(
        optionValues,
        command,
      );
      return writePayload(emailPayload(address, options.subject, options.body), options);
    });

  addGlobalOptions(program.command('phone <phone>'))
    .description('Generate a tel QR code')
    .action((phone: string, optionValues: GlobalOptions, command: Command) =>
      writePayload(phonePayload(phone), opts(optionValues, command)),
    );

  addGlobalOptions(program.command('sms <phone>'))
    .description('Generate an SMS QR code')
    .option('--message <message>', 'SMS message')
    .action((phone: string, optionValues: GlobalOptions, command: Command) => {
      const options = opts<GlobalOptions & { message?: string }>(optionValues, command);
      return writePayload(smsPayload(phone, options.message), options);
    });

  addGlobalOptions(program.command('vcard'))
    .description('Generate a vCard QR code')
    .requiredOption('--name <name>', 'contact name')
    .option('--phone <phone>', 'contact phone')
    .option('--email <email>', 'contact email')
    .option('--org <org>', 'organization')
    .option('--title <title>', 'title')
    .option('--url <url>', 'URL')
    .action((optionValues: GlobalOptions, command: Command) => {
      const options = opts<
        GlobalOptions & {
          name: string;
          phone?: string;
          email?: string;
          org?: string;
          title?: string;
          url?: string;
        }
      >(optionValues, command);
      return writePayload(vcardPayload(options), options);
    });

  addGlobalOptions(program.command('geo'))
    .description('Generate a geo QR code')
    .requiredOption('--lat <lat>', 'latitude')
    .requiredOption('--lng <lng>', 'longitude')
    .action((optionValues: GlobalOptions, command: Command) => {
      const options = opts<GlobalOptions & { lat: string; lng: string }>(optionValues, command);
      return writePayload(geoPayload(Number(options.lat), Number(options.lng)), options);
    });

  addGlobalOptions(program.command('raw <payload>'))
    .description('Generate a QR code from a custom raw payload')
    .action((payload: string, optionValues: GlobalOptions, command: Command) =>
      writePayload(rawPayload(payload), opts(optionValues, command)),
    );

  addGlobalOptions(program.command('export'))
    .description('Export a QR code from --payload')
    .option('--payload <payload>', 'payload to export', 'Fast QR codes from your terminal.')
    .action((optionValues: GlobalOptions, command: Command) => {
      const options = opts<GlobalOptions & { payload: string }>(optionValues, command);
      return writePayload(rawPayload(options.payload), options);
    });

  program.exitOverride();
  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  try {
    await createCli().parseAsync(argv);
  } catch (error) {
    if ((error as { code?: string }).code === 'commander.helpDisplayed') return;
    process.stderr.write(`${messageFromError(error)}\n`);
    process.exitCode = 1;
  }
}
