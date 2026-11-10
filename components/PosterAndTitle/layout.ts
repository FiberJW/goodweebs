export const POSTER_GAP = 16;

// Measure the content view: a window can also contain a sidebar or Duo rail.
export function getPosterGrid(availableWidth: number) {
  const columns = Math.max(1, Math.ceil((availableWidth + POSTER_GAP) / 176));
  const width = Math.max(
    0,
    (availableWidth - POSTER_GAP * (columns - 1)) / columns,
  );
  return { columns, width, height: Math.round((width * 10) / 7) };
}
