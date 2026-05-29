import { currentPlatform } from '../utils/os.js';
import { UserError } from '../utils/errors.js';
import { detectLinuxWifi } from './linux.js';
import { detectMacosWifi } from './macos.js';
import type { DetectedWifi } from './parse.js';
import { detectWindowsWifi } from './windows.js';

export async function detectCurrentWifi(): Promise<DetectedWifi> {
  const platform = currentPlatform();
  if (platform === 'linux') return detectLinuxWifi();
  if (platform === 'windows') return detectWindowsWifi();
  if (platform === 'macos') return detectMacosWifi();
  throw new UserError('Current WiFi detection is not supported on this platform.');
}
