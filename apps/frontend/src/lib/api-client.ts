export class ApiRequestError extends Error {
  public statusCode: number;
  public errors: unknown[];

  constructor(statusCode: number, message: string, errors: unknown[] = []) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface ApiResponseShape<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

class ApiClient {
  constructor(private baseUrl: string = "/api") {}

  private buildQuery(params?: QueryParams): string {
    if (!params) return "";
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    ) as [string, string][];
    if (entries.length === 0) return "";
    return `?${new URLSearchParams(entries).toString()}`;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include", // send the session cookie (NextAuth or custom)
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Some responses (e.g. DELETE / CSV export) may not return JSON.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      if (!res.ok) {
        throw new ApiRequestError(
          res.status,
          res.statusText || "Request failed"
        );
      }
      return undefined as T;
    }

    const json = (await res.json()) as ApiResponseShape<T>;

    if (!res.ok || !json.success) {
      throw new ApiRequestError(
        json.statusCode ?? res.status,
        json.message ?? "Something went wrong",
        (json as any).errors ?? []
      );
    }

    return json.data;
  }

  get<T>(path: string, params?: QueryParams): Promise<T> {
    return this.request<T>(`${path}${this.buildQuery(params)}`, {
      method: "GET",
    });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

// Single shared instance — import this into every service, don't `new` it yourself.
export const apiClient = new ApiClient();
