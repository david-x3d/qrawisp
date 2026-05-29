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

export interface MeCardInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  url?: string;
  note?: string;
}

function mecardEscape(value: string): string {
  return normalizeLineEndings(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/:/g, '\\:')
    .replace(/\n/g, '\\n');
}

export function mecardPayload(input: MeCardInput): string {
  if (!input.name.trim()) {
    throw new Error('Contact name is required.');
  }
  const parts = [`N:${mecardEscape(input.name)}`];
  if (input.phone) parts.push(`TEL:${phonePayload(input.phone).replace(/^tel:/, '')}`);
  if (input.email) parts.push(`EMAIL:${mecardEscape(input.email)}`);
  if (input.address) parts.push(`ADR:${mecardEscape(input.address)}`);
  if (input.url) parts.push(`URL:${normalizeUrl(input.url)}`);
  if (input.note) parts.push(`NOTE:${mecardEscape(input.note)}`);
  return `MECARD:${parts.join(';')};;`;
}

export interface CalendarEventInput {
  summary: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
  uid?: string;
  dtstamp?: string;
}

function icsEscape(value: string): string {
  return normalizeLineEndings(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function toIcsDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{8}(T\d{6}Z?)?$/.test(trimmed)) return trimmed;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Calendar dates must be valid ISO dates or iCalendar date values.');
  }
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function calendarEventPayload(input: CalendarEventInput): string {
  if (!input.summary.trim()) throw new Error('Event summary is required.');
  if (!input.start.trim()) throw new Error('Event start is required.');
  const dtstamp = toIcsDate(input.dtstamp ?? new Date().toISOString());
  const uid =
    input.uid ??
    `qrawisp-${Buffer.from(`${input.summary}:${input.start}`).toString('base64url')}@qrawisp`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Qrawisp//QR Event//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${toIcsDate(input.start)}`,
  ];
  if (input.end) lines.push(`DTEND:${toIcsDate(input.end)}`);
  lines.push(`SUMMARY:${icsEscape(input.summary)}`);
  if (input.location) lines.push(`LOCATION:${icsEscape(input.location)}`);
  if (input.description) lines.push(`DESCRIPTION:${icsEscape(input.description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

export function whatsappPayload(phone: string, message?: string): string {
  const normalized = phone.replace(/[^\d]/g, '');
  if (!/^\d{6,20}$/.test(normalized)) {
    throw new Error('A valid WhatsApp phone number with country code is required.');
  }
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export interface BitcoinInput {
  address: string;
  amount?: string;
  label?: string;
  message?: string;
}

export function bitcoinPayload(input: BitcoinInput): string {
  if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/i.test(input.address.trim())) {
    throw new Error('A valid Bitcoin address is required.');
  }
  const params = new URLSearchParams();
  if (input.amount) params.set('amount', input.amount);
  if (input.label) params.set('label', input.label);
  if (input.message) params.set('message', input.message);
  const query = params.toString();
  return `bitcoin:${input.address.trim()}${query ? `?${query}` : ''}`;
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
