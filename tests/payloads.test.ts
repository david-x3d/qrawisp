import { describe, expect, it } from 'vitest';
import {
  bitcoinPayload,
  calendarEventPayload,
  emailPayload,
  geoPayload,
  mecardPayload,
  normalizeUrl,
  phonePayload,
  smsPayload,
  urlPayload,
  vcardPayload,
  whatsappPayload,
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

  it('generates MeCard payloads', () => {
    expect(
      mecardPayload({
        name: 'David',
        phone: '+49123456789',
        email: 'test@example.com',
        url: 'd4vid.io',
      }),
    ).toBe('MECARD:N:David;TEL:+49123456789;EMAIL:test@example.com;URL:https://d4vid.io/;;');
  });

  it('generates calendar event payloads', () => {
    expect(
      calendarEventPayload({
        summary: 'Demo',
        start: '2026-06-01T10:00:00Z',
        end: '2026-06-01T10:30:00Z',
        location: 'Terminal',
        uid: 'demo@qrawisp',
        dtstamp: '20260529T180000Z',
      }),
    ).toBe(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Qrawisp//QR Event//EN',
        'BEGIN:VEVENT',
        'UID:demo@qrawisp',
        'DTSTAMP:20260529T180000Z',
        'DTSTART:20260601T100000Z',
        'DTEND:20260601T103000Z',
        'SUMMARY:Demo',
        'LOCATION:Terminal',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n'),
    );
  });

  it('generates WhatsApp payloads', () => {
    expect(whatsappPayload('+49 123 456789', 'Hello there')).toBe(
      'https://wa.me/49123456789?text=Hello%20there',
    );
  });

  it('generates Bitcoin payment payloads', () => {
    expect(
      bitcoinPayload({
        address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080',
        amount: '0.01',
        label: 'Qrawisp',
      }),
    ).toBe('bitcoin:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080?amount=0.01&label=Qrawisp');
  });

  it('generates geo payloads', () => {
    expect(geoPayload(50.9375, 6.9603)).toBe('geo:50.9375,6.9603');
  });
});
