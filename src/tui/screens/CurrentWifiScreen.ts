import { wifiPayload } from '../../qr/payloads.js';
import { detectCurrentWifi } from '../../wifi/detect.js';
import type { ScreenDefinition } from './types.js';

export const CurrentWifiScreen: ScreenDefinition = {
  id: 'current-wifi',
  title: 'Current WiFi',
  fields: [
    { key: 'password', label: 'Manual password fallback', kind: 'password' },
    { key: 'hidden', label: 'Hidden network', kind: 'checkbox', value: false },
  ],
  note: 'Detects the current SSID and password when the OS permits it.',
  async buildPayload(values) {
    const detected = await detectCurrentWifi();
    return wifiPayload({
      ...detected,
      password: detected.password ?? String(values.password ?? ''),
      hidden: Boolean(values.hidden),
    });
  },
};
