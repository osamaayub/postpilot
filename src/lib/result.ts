/** Expected failures are values, not exceptions. */
export type Result<T, E extends string = string> =
  | { ok: true; value: T }
  | { ok: false; error: E; message: string };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E extends string>(error: E, message: string): Result<never, E> => ({ ok: false, error, message });

/** The shape every form Server Action returns to `useActionState`. */
export type ActionState<F extends Record<string, string> = Record<string, string>> =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message: string; fields?: Partial<F> };
