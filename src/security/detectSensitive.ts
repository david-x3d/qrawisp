export interface SensitiveFinding {
  label: string;
  pattern: RegExp;
}

const findings: SensitiveFinding[] = [
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: 'OpenAI API key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { label: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  {
    label: 'secret environment variable',
    pattern: /\b[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|API_KEY)[A-Z0-9_]*\s*=\s*['"]?[^'"\s]{8,}/i,
  },
  { label: 'password assignment', pattern: /\b(password|passwd|pwd)\s*[:=]\s*['"]?[^'"\s]{8,}/i },
  { label: 'bearer token', pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/i },
];

export function detectSensitive(value: string): string[] {
  return findings.filter((finding) => finding.pattern.test(value)).map((finding) => finding.label);
}
