/**
 * LinkedIn shows about three lines (roughly 210 characters) of a post in the
 * feed, then "...see more". Everything people decide happens above that fold.
 */
export const FOLD_LINES = 3;
export const FOLD_CHARS = 210;

export type Folded = { visible: string; hidden: string; folded: boolean };

export function foldPost(body: string, lines = FOLD_LINES, chars = FOLD_CHARS): Folded {
  const text = body.trim();
  const byLines = text.split("\n").slice(0, lines).join("\n");
  let visible = byLines.length > chars ? byLines.slice(0, chars) : byLines;
  // Never cut a word in half.
  if (visible.length < text.length && /\S/.test(text[visible.length] ?? "")) {
    const space = visible.lastIndexOf(" ");
    if (space > chars * 0.6) visible = visible.slice(0, space);
  }
  visible = visible.trimEnd();
  const hidden = text.slice(visible.length).replace(/^\s+/, "");
  return { visible, hidden, folded: hidden.length > 0 };
}

/** The first line is the hook: the only thing most readers see. */
export const hookOf = (body: string) => body.trim().split("\n")[0] ?? "";
