import { geoPayload } from '../../qr/payloads.js';
import type { ScreenDefinition } from './types.js';

export const GeoScreen: ScreenDefinition = {
  id: 'geo',
  title: 'Geo Location',
  fields: [
    { key: 'lat', label: 'Latitude', kind: 'text', value: '50.9375' },
    { key: 'lng', label: 'Longitude', kind: 'text', value: '6.9603' },
  ],
  buildPayload: (values) => geoPayload(Number(values.lat), Number(values.lng)),
};
