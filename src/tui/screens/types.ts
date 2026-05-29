export type FieldKind = 'text' | 'password' | 'checkbox' | 'select';

export interface FieldDefinition {
  key: string;
  label: string;
  kind: FieldKind;
  value?: string | boolean;
  options?: string[];
}

export interface ScreenDefinition {
  id: string;
  title: string;
  fields: FieldDefinition[];
  buildPayload(values: Record<string, string | boolean>): Promise<string> | string;
  note?: string;
}
