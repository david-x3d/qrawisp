import { wifiPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const ManualWifiScreen: ScreenDefinition = {
  id: 'manual-wifi',
  title: 'Manual WiFi',
  fields: [
    { key: 'ssid', label: 'SSID', kind: 'text' },
    { key: 'password', label: 'Password', kind: 'password' },
    {
      key: 'type',
      label: 'Encryption',
      kind: 'select',
      value: 'WPA',
      options: ['WPA', 'WEP', 'nopass'],
    },
    { key: 'hidden', label: 'Hidden network', kind: 'checkbox', value: false },
  ],
  buildPayload(values) {
    return wifiPayload({
      ssid: String(values.ssid ?? ''),
      password: String(values.password ?? ''),
      type: values.type as 'WPA' | 'WEP' | 'nopass',
      hidden: Boolean(values.hidden),
    });
  },
};
