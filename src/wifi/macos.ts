import { execa } from 'execa';
import { UserError } from '../utils/errors.js';
import type { DetectedWifi } from './parse.js';
import { parseMacSecurityPassword, parseNetworksetupAirport } from './parse.js';

export async function detectMacosWifi(): Promise<DetectedWifi> {
  for (const device of ['en0', 'en1']) {
    try {
      const airport = await execa('networksetup', ['-getairportnetwork', device]);
      const ssid = parseNetworksetupAirport(airport.stdout);
      if (!ssid) continue;
      try {
        const security = await execa('security', ['find-generic-password', '-ga', ssid]);
        return {
          ssid,
          password: parseMacSecurityPassword(`${security.stdout}\n${security.stderr}`),
          type: 'WPA',
          hidden: false,
        };
      } catch {
        return { ssid, type: 'WPA', hidden: false };
      }
    } catch {
      // Try the next WiFi interface.
    }
  }
  throw new UserError('Could not detect the current WiFi network on macOS.');
}
