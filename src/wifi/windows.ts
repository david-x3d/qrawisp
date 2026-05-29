import { execa } from 'execa';
import { UserError } from '../utils/errors.js';
import type { DetectedWifi } from './parse.js';
import { parseNetshInterfaces, parseNetshProfile } from './parse.js';

export async function detectWindowsWifi(): Promise<DetectedWifi> {
  const interfaces = await execa('netsh', ['wlan', 'show', 'interfaces']);
  const ssid = parseNetshInterfaces(interfaces.stdout);
  if (!ssid) throw new UserError('No active WiFi network was found.');
  try {
    const profile = await execa('netsh', [
      'wlan',
      'show',
      'profile',
      `name="${ssid}"`,
      'key=clear',
    ]);
    return { ssid, hidden: false, ...parseNetshProfile(profile.stdout) };
  } catch {
    return { ssid, hidden: false };
  }
}
