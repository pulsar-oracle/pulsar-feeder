/**
 * Run `task` immediately, then again every `intervalMs`, never overlapping.
 *
 * Unlike `setInterval`, the next run is only scheduled once the current one
 * has finished. A slow cycle (e.g. waiting on transaction confirmation)
 * therefore can't start a second cycle in parallel that submits from the
 * same account and fails on a stale sequence number.
 *
 * Returns a function that stops the loop.
 */
export function runEvery(
  task: () => Promise<void>,
  intervalMs: number,
  onOverrun?: (elapsedMs: number) => void
): () => void {
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;

  const tick = async () => {
    const started = Date.now();
    try {
      await task();
    } catch (err) {
      console.error("Cycle failed:", (err as Error).message);
    }
    if (stopped) return;

    const elapsed = Date.now() - started;
    if (elapsed > intervalMs) onOverrun?.(elapsed);
    timer = setTimeout(tick, Math.max(0, intervalMs - elapsed));
  };

  void tick();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
