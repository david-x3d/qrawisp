import { execa } from 'execa';
import { UserError } from '../utils/errors.js';
import type { DetectedWifi } from './parse.js';
import { parseNmcliActiveWifi, parseNmcliConnectionSecrets } from './parse.js';

export async function detectLinuxWifi(): Promise<DetectedWifi> {
  try {
    const active = await execa('nmcli', ['-t', '-f', 'active,ssid', 'dev', 'wifi']);
    const ssid = parseNmcliActiveWifi(active.stdout);
    if (!ssid) throw new UserError('No active WiFi network was found.');
    try {
      const secrets = await execa('nmcli', ['connection', 'show', ssid, '--show-secrets']);
      return { ssid, hidden: false, ...parseNmcliConnectionSecrets(secrets.stdout) };
    } catch {
      return { ssid, hidden: false };
    }
  } catch {
    try {
      const fallback = await execa('iwgetid', ['-r']);
      const ssid = fallback.stdout.trim();
      if (ssid) return { ssid, hidden: false };
    } catch {
      // Fall through to a user-facing error below.
    }
  }
  throw new UserError('Could not detect the current WiFi network on Linux.');
}
