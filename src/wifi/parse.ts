import type { WifiEncryption } from '../qr/payloads.js';

export interface DetectedWifi {
  ssid: string;
  type?: WifiEncryption;
  password?: string;
  hidden?: boolean;
}

export function parseNmcliActiveWifi(output: string): string | undefined {
  for (const line of output.split(/\r?\n/)) {
    const [active, ...ssidParts] = line.split(':');
    const ssid = ssidParts.join(':').replace(/\\:/g, ':');
    if (active === 'yes' && ssid) return ssid;
  }
  return undefined;
}

export function parseNmcliConnectionSecrets(output: string): Partial<DetectedWifi> {
  const result: Partial<DetectedWifi> = {};
  for (const line of output.split(/\r?\n/)) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    if (key === '802-11-wireless.ssid' && value) result.ssid = value;
    if (key === '802-11-wireless-security.key-mgmt' && value)
      result.type = value.includes('wpa') ? 'WPA' : 'WEP';
    if (key === '802-11-wireless-security.psk' && value) result.password = value;
  }
  return result;
}

export function parseNetshInterfaces(output: string): string | undefined {
  const match = output.match(/^\s*SSID\s*:\s*(.+)$/im);
  return match?.[1]?.trim();
}

export function parseNetshProfile(output: string): Partial<DetectedWifi> {
  const password = output.match(/^\s*Key Content\s*:\s*(.+)$/im)?.[1]?.trim();
  const auth = output
    .match(/^\s*Authentication\s*:\s*(.+)$/im)?.[1]
    ?.trim()
    .toLowerCase();
  const ssid = output.match(/^\s*SSID name\s*:\s*"(.+)"$/im)?.[1]?.trim();
  return {
    ssid,
    password,
    type: auth?.includes('wep') ? 'WEP' : auth?.includes('open') ? 'nopass' : 'WPA',
  };
}

export function parseNetworksetupAirport(output: string): string | undefined {
  const match = output.match(/Current Wi-Fi Network:\s*(.+)$/im);
  return match?.[1]?.trim();
}

export function parseMacSecurityPassword(output: string): string | undefined {
  const match = output.match(/password:\s*"([\s\S]*?)"/im);
  return match?.[1];
}
