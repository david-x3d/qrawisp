export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
