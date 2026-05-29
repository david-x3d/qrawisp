import { describe, expect, it } from 'vitest';
import { detectSensitive } from '../src/security/detectSensitive.js';

describe('sensitive clipboard detection', () => {
  it('detects API keys, tokens, passwords, private keys, and secret env vars', () => {
    const text = [
      'OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz123456',
      'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456',
      'password: supersecretvalue',
      '-----BEGIN PRIVATE KEY-----',
    ].join('\n');
    expect(detectSensitive(text)).toEqual(
      expect.arrayContaining([
        'OpenAI API key',
        'bearer token',
        'password assignment',
        'private key',
      ]),
    );
  });

  it('does not flag ordinary text', () => {
    expect(detectSensitive('Fast QR codes from your terminal.')).toEqual([]);
  });
});
