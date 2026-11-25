export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  milestones?: string[];
  celebrate?: boolean;
  warnings?: string[];
} | null;
