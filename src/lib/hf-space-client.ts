type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ResponseType = "json" | "text" | "arrayBuffer" | "response";

export interface HfSpaceClientOptions {
  token?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  userAgent?: string;
}

export interface SpaceRequestOptions {
  spaceId: string;
  path: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: BodyInit | Record<string, unknown>;
  responseType?: ResponseType;
  timeoutMs?: number;
  retries?: number;
  directSubdomain?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 700;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (status: number): boolean => status === 429 || status >= 500;

function getSpaceBaseUrl(spaceId: string, directSubdomain: boolean): string {
  const normalizedSpaceId = normalizeSpaceRef(spaceId);

  if (!normalizedSpaceId.includes("/")) {
    throw new Error(
      `Invalid spaceId "${spaceId}". Expected format "owner/name" or a Hugging Face Space URL.`
    );
  }

  const [owner, name] = normalizedSpaceId.split("/");
  if (!owner || !name) {
    throw new Error(
      `Invalid spaceId "${spaceId}". Expected format "owner/name" or a Hugging Face Space URL.`
    );
  }

  if (directSubdomain) {
    return `https://${owner}-${name}.hf.space`;
  }

  return `https://huggingface.co/spaces/${owner}/${name}`;
}

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function normalizeSpaceRef(spaceRef: string): string {
  const trimmed = spaceRef.trim();
  if (!trimmed) {
    throw new Error("spaceId cannot be empty.");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const parsed = new URL(trimmed);
    const chunks = parsed.pathname.split("/").filter(Boolean);

    if (chunks.length >= 3 && chunks[0] === "spaces") {
      return `${chunks[1]}/${chunks[2]}`;
    }

    throw new Error(
      `Invalid Hugging Face Space URL "${spaceRef}". Expected format "https://huggingface.co/spaces/owner/name".`
    );
  }

  return trimmed;
}

function withQueryString(
  url: URL,
  query: Record<string, string | number | boolean | undefined>
): URL {
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url;
}

export class HfSpaceClient {
  private readonly token?: string;

  private readonly timeoutMs: number;

  private readonly retries: number;

  private readonly retryDelayMs: number;

  private readonly userAgent: string;

  constructor(options: HfSpaceClientOptions = {}) {
    this.token =
      options.token ??
      process.env.HF_TOKEN ??
      process.env.HUGGINGFACEHUB_API_TOKEN;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = options.retries ?? DEFAULT_RETRIES;
    this.retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    this.userAgent = options.userAgent ?? "dev2site3-hf-space-client/1.0";
  }

  async request<T = unknown>(options: SpaceRequestOptions): Promise<T> {
    const method = options.method ?? "GET";
    const responseType = options.responseType ?? "json";
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const retries = options.retries ?? this.retries;
    const directSubdomain = options.directSubdomain ?? false;
    const path = normalizePath(options.path);

    const baseUrl = getSpaceBaseUrl(options.spaceId, directSubdomain);
    const url = new URL(`${baseUrl}${path}`);

    if (options.query) {
      withQueryString(url, options.query);
    }

    const headers: Record<string, string> = {
      "User-Agent": this.userAgent,
      ...(options.headers ?? {}),
    };

    if (this.token && !headers.Authorization) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let requestBody: BodyInit | undefined;
    if (options.body !== undefined) {
      if (
        typeof options.body === "object" &&
        options.body !== null &&
        !(options.body instanceof FormData) &&
        !(options.body instanceof URLSearchParams) &&
        !(options.body instanceof Blob) &&
        !(options.body instanceof ArrayBuffer)
      ) {
        headers["Content-Type"] =
          headers["Content-Type"] ?? "application/json";
        requestBody = JSON.stringify(options.body);
      } else {
        requestBody = options.body as BodyInit;
      }
    }

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const abortController = new AbortController();
      const timeoutHandle = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: requestBody,
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (attempt < retries && shouldRetry(response.status)) {
            clearTimeout(timeoutHandle);
            await sleep(this.retryDelayMs * (attempt + 1));
            continue;
          }

          const errorText = await response.text();
          throw new Error(
            `Hugging Face Space request failed (${response.status} ${response.statusText}): ${errorText}`
          );
        }

        if (responseType === "response") {
          return response as T;
        }

        if (responseType === "text") {
          const text = await response.text();
          return text as T;
        }

        if (responseType === "arrayBuffer") {
          const binary = await response.arrayBuffer();
          return binary as T;
        }

        const json = (await response.json()) as T;
        return json;
      } catch (error) {
        if (attempt < retries) {
          await sleep(this.retryDelayMs * (attempt + 1));
          continue;
        }

        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(
            `Hugging Face Space request timed out after ${timeoutMs} ms.`
          );
        }

        throw error;
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    throw new Error("Unexpected request state.");
  }

  async getText(spaceId: string, path: string): Promise<string> {
    return this.request<string>({
      spaceId,
      path,
      method: "GET",
      responseType: "text",
    });
  }
}

export async function fetchSpaceAgentsMarkdown(
  spaceId =
    process.env.HF_DEFAULT_SPACE_ID ??
    "https://huggingface.co/spaces/mrfakename/Z-Image-Turbo",
  options: HfSpaceClientOptions = {}
): Promise<string> {
  const client = new HfSpaceClient(options);
  return client.getText(spaceId, "/agents.md");
}
