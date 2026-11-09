/** Default upper bound for a single price API request. */
export const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * GET `url` and parse the JSON body, failing if the whole request (including
 * reading the body) takes longer than `timeoutMs`.
 *
 * Without a timeout, a price API that accepts the connection but never
 * responds stalls the feeder's cycle indefinitely, and every later cycle
 * with it.
 */
export async function fetchJson<T>(
  url: string,
  source: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`${source} request failed: ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if ((err as Error).name === "TimeoutError") {
      throw new Error(`${source} request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}
