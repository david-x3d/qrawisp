export type Platform = 'linux' | 'windows' | 'macos' | 'unknown';

export function currentPlatform(): Platform {
  if (process.platform === 'linux') return 'linux';
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'macos';
  return 'unknown';
}
