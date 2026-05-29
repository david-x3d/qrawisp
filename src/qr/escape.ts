export function escapeWifiField(value = ''): string {
  return value.replace(/([\\;,":])/g, '\\$1');
}

export function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
