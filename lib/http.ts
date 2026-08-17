import "server-only";

export const DEALFORGE_USER_AGENT =
  process.env.DEALFORGE_USER_AGENT ??
  "DealForge/1.0 (https://github.com/omaralihusam2000-coder/get-your-deal)";

export class SourceError extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "SourceError";
  }
}

type FetchJsonOptions = {
  revalidate?: number;
  timeoutMs?: number;
  headers?: HeadersInit;
};

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { revalidate = 300, timeoutMs = 12_000, headers } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": DEALFORGE_USER_AGENT,
        ...headers,
      },
      next: { revalidate },
    });

    if (!response.ok) {
      throw new SourceError(
        `Request failed with ${response.status}`,
        new URL(url).hostname,
        response.status,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SourceError) throw error;
    throw new SourceError(
      error instanceof Error ? error.message : "Network error",
      new URL(url).hostname,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url: string, options: FetchJsonOptions = {}): Promise<string> {
  const { revalidate = 0, timeoutMs = 12_000, headers } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain",
        "User-Agent": DEALFORGE_USER_AGENT,
        ...headers,
      },
      next: { revalidate },
    });
    if (!response.ok) {
      throw new SourceError(`Request failed with ${response.status}`, new URL(url).hostname, response.status);
    }
    return response.text();
  } catch (error) {
    if (error instanceof SourceError) throw error;
    throw new SourceError(error instanceof Error ? error.message : "Network error", new URL(url).hostname);
  } finally {
    clearTimeout(timer);
  }
}

export async function settled<T>(
  promise: Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await promise };
  } catch (error) {
    return { ok: false, error };
  }
}
