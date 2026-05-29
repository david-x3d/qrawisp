import { escapeWifiField, normalizeLineEndings } from './escape.js';

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiPayloadInput {
  ssid: string;
  password?: string;
  type?: WifiEncryption;
  hidden?: boolean;
}

export function wifiPayload(input: WifiPayloadInput): string {
  if (!input.ssid.trim()) {
    throw new Error('WiFi SSID is required.');
  }
  const type = input.type ?? (input.password ? 'WPA' : 'nopass');
  const parts = [`WIFI:T:${type}`, `S:${escapeWifiField(input.ssid)}`];
  if (type !== 'nopass' && input.password) {
    parts.push(`P:${escapeWifiField(input.password)}`);
  }
  parts.push(`H:${input.hidden ? 'true' : 'false'}`);
  return `${parts.join(';')};;`;
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('URL is required.');
  }
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }
  return url.toString();
}

export function urlPayload(value: string): string {
  return normalizeUrl(value);
}

export function textPayload(value: string): string {
  if (!value.length) {
    throw new Error('Text is required.');
  }
  return normalizeLineEndings(value);
}

export function emailPayload(address: string, subject?: string, body?: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new Error('A valid email address is required.');
  }
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${address}${query ? `?${query}` : ''}`;
}

export function phonePayload(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, '');
  if (!/^\+?\d{3,20}$/.test(normalized)) {
    throw new Error('A valid phone number is required.');
  }
  return `tel:${normalized}`;
}

export function smsPayload(phone: string, message?: string): string {
  const base = phonePayload(phone).replace(/^tel:/, 'sms:');
  return message ? `${base}?body=${encodeURIComponent(message)}` : base;
}

export interface VCardInput {
  name: string;
  phone?: string;
  email?: string;
  org?: string;
  title?: string;
  url?: string;
}

function vcardEscape(value: string): string {
  return normalizeLineEndings(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function vcardPayload(input: VCardInput): string {
  if (!input.name.trim()) {
    throw new Error('Contact name is required.');
  }
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${vcardEscape(input.name)}`];
  if (input.org) lines.push(`ORG:${vcardEscape(input.org)}`);
  if (input.title) lines.push(`TITLE:${vcardEscape(input.title)}`);
  if (input.phone) lines.push(`TEL:${phonePayload(input.phone).replace(/^tel:/, '')}`);
  if (input.email) lines.push(`EMAIL:${input.email}`);
  if (input.url) lines.push(`URL:${normalizeUrl(input.url)}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function geoPayload(lat: number, lng: number): string {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90.');
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180.');
  }
  return `geo:${lat},${lng}`;
}

export function rawPayload(value: string): string {
  if (!value.length) {
    throw new Error('Raw payload is required.');
  }
  return value;
}
