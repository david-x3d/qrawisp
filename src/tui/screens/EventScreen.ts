import { calendarEventPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const EventScreen: ScreenDefinition = {
  id: 'event',
  title: 'Calendar Event',
  fields: [
    { key: 'summary', label: 'Summary', kind: 'text', value: 'Qrawisp demo' },
    { key: 'start', label: 'Start', kind: 'text', value: '2026-06-01T10:00:00Z' },
    { key: 'end', label: 'End', kind: 'text', value: '2026-06-01T10:30:00Z' },
    { key: 'location', label: 'Location', kind: 'text' },
    { key: 'description', label: 'Description', kind: 'text' },
  ],
  buildPayload: (values) =>
    calendarEventPayload({
      summary: String(values.summary ?? ''),
      start: String(values.start ?? ''),
      end: String(values.end ?? ''),
      location: String(values.location ?? ''),
      description: String(values.description ?? ''),
    }),
};
