import clipboard from 'clipboardy';
import { detectSensitive } from '../security/detectSensitive.js';

export interface ClipboardReadResult {
  text: string;
  sensitiveFindings: string[];
  isVeryLong: boolean;
}

export async function readClipboard(): Promise<ClipboardReadResult> {
  const text = await clipboard.read();
  return {
    text,
    sensitiveFindings: detectSensitive(text),
    isVeryLong: text.length > 1200,
  };
}
