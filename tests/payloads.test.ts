import { describe, expect, it } from 'vitest';
import {
  emailPayload,
  geoPayload,
  normalizeUrl,
  phonePayload,
  smsPayload,
  urlPayload,
  vcardPayload,
  wifiPayload,
} from '../src/qr/payloads.js';

describe('QR payloads', () => {
  it('escapes WiFi QR fields', () => {
    expect(wifiPayload({ ssid: 'Cafe;Net', password: 'pa:ss,word\\x', type: 'WPA' })).toBe(
      'WIFI:T:WPA;S:Cafe\\;Net;P:pa\\:ss\\,word\\\\x;H:false;;',
    );
  });

  it('normalizes URLs without a scheme', () => {
    expect(normalizeUrl('d4vid.io')).toBe('https://d4vid.io/');
    expect(urlPayload('https://example.com/a')).toBe('https://example.com/a');
  });

  it('generates mailto payloads', () => {
    expect(emailPayload('user@example.com', 'Hello', 'Test body')).toBe(
      'mailto:user@example.com?subject=Hello&body=Test+body',
    );
  });

  it('generates tel payloads', () => {
    expect(phonePayload('+49 123 456789')).toBe('tel:+49123456789');
  });

  it('generates sms payloads', () => {
    expect(smsPayload('+49123456789', 'Hello there')).toBe('sms:+49123456789?body=Hello%20there');
  });

  it('generates vCard 3.0 payloads', () => {
    expect(vcardPayload({ name: 'David', phone: '+49123456789', email: 'test@example.com' })).toBe(
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:David',
        'TEL:+49123456789',
        'EMAIL:test@example.com',
        'END:VCARD',
      ].join('\n'),
    );
  });

  it('generates geo payloads', () => {
    expect(geoPayload(50.9375, 6.9603)).toBe('geo:50.9375,6.9603');
  });
});
