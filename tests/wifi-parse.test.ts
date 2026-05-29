import { describe, expect, it } from 'vitest';
import {
  parseMacSecurityPassword,
  parseNetshInterfaces,
  parseNetshProfile,
  parseNetworksetupAirport,
  parseNmcliActiveWifi,
  parseNmcliConnectionSecrets,
} from '../src/wifi/parse.js';

describe('WiFi parsers', () => {
  it('parses active Linux nmcli SSID', () => {
    expect(parseNmcliActiveWifi('no:Other\nyes:Home\\:Office\n')).toBe('Home:Office');
  });

  it('parses Linux nmcli connection secrets', () => {
    expect(
      parseNmcliConnectionSecrets(
        [
          '802-11-wireless.ssid:Home',
          '802-11-wireless-security.key-mgmt:wpa-psk',
          '802-11-wireless-security.psk:secret',
        ].join('\n'),
      ),
    ).toEqual({ ssid: 'Home', type: 'WPA', password: 'secret' });
  });

  it('parses Windows netsh interfaces', () => {
    expect(parseNetshInterfaces('    SSID                   : MyWiFi\n')).toBe('MyWiFi');
  });

  it('parses Windows netsh profile secrets', () => {
    const output = [
      '    SSID name              : "MyWiFi"',
      '    Authentication         : WPA2-Personal',
      '    Key Content            : secret',
    ].join('\n');
    expect(parseNetshProfile(output)).toEqual({ ssid: 'MyWiFi', type: 'WPA', password: 'secret' });
  });

  it('parses macOS networksetup output', () => {
    expect(parseNetworksetupAirport('Current Wi-Fi Network: MyWiFi')).toBe('MyWiFi');
  });

  it('parses macOS security password output', () => {
    expect(parseMacSecurityPassword('password: "secret"')).toBe('secret');
  });
});
