import { request as playwrightRequest, expect } from "@playwright/test";
import type { APIRequestContext, APIResponse } from "@playwright/test";
import { comFunc } from "../commonFunctions/commonFunctions";
import { BASE_URL } from "../commonFunctions/globalVariables";

/**
 * ApiClient — the API layer of the pyramid, with the same logging contract as
 * the UI layer.
 *
 * `test-strategy` has always assigned work to an API tier; this is what
 * `/generate-api-tests` writes against so those assignments become real specs
 * instead of a row in a table. Every call is logged through `comFunc` exactly
 * like a Page Object step, so an API spec's Allure/`out.txt` output reads the
 * same as an E2E one.
 *
 * Usage in a spec:
 *   const api = await ApiClient.create();
 *   const res = await api.get("/api/facilities/DFW");
 *   await api.expectStatus(res, 200);
 *   const body = await api.json<Facility>(res);
 *   await api.dispose();
 */
export interface ApiClientOptions {
  /** Defaults to BASE_URL (or API_BASE_URL if set — APIs often live on another host). */
  baseURL?: string;
  /** Extra headers merged into every request (auth token, tenant id, …). */
  headers?: Record<string, string>;
  /** Per-request timeout in ms. */
  timeout?: number;
  ignoreHTTPSErrors?: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  /** JSON body. Use `form` or `multipart` via `raw()` for other content types. */
  data?: unknown;
  timeout?: number;
}

export class ApiClient {
  private constructor(
    readonly ctx: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  static async create(options: ApiClientOptions = {}): Promise<ApiClient> {
    const baseURL = options.baseURL || process.env.API_BASE_URL || BASE_URL;
    const ctx = await playwrightRequest.newContext({
      baseURL,
      extraHTTPHeaders: { Accept: "application/json", ...options.headers },
      timeout: options.timeout ?? 30_000,
      ignoreHTTPSErrors: options.ignoreHTTPSErrors ?? false,
    });
    comFunc.reportMessageInfo(`API client created against ${baseURL}`);
    return new ApiClient(ctx, baseURL);
  }

  get(path: string, options: RequestOptions = {}) {
    return this.send("GET", path, options);
  }

  post(path: string, options: RequestOptions = {}) {
    return this.send("POST", path, options);
  }

  put(path: string, options: RequestOptions = {}) {
    return this.send("PUT", path, options);
  }

  patch(path: string, options: RequestOptions = {}) {
    return this.send("PATCH", path, options);
  }

  delete(path: string, options: RequestOptions = {}) {
    return this.send("DELETE", path, options);
  }

  /**
   * Asserts the response status and logs pass/fail in the framework's format
   * instead of throwing a bare Playwright error.
   */
  async expectStatus(response: APIResponse, expected: number): Promise<void> {
    const actual = response.status();
    if (actual === expected) {
      comFunc.reportMessagePass(`${response.url()} returned ${actual} as expected`);
      return;
    }
    const body = (await response.text()).slice(0, 500);
    comFunc.reportMessageFail(
      `${response.url()} returned ${actual}, expected ${expected}. Body: ${body}`,
    );
    expect(actual, `Expected ${expected} from ${response.url()}`).toBe(expected);
  }

  /** Parses a JSON body, failing with the raw text (not a parser stack) when it isn't JSON. */
  async json<T = unknown>(response: APIResponse): Promise<T> {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      comFunc.reportMessageFail(
        `Response from ${response.url()} was not valid JSON: ${text.slice(0, 300)}`,
      );
      throw new Error(`Non-JSON response from ${response.url()}`);
    }
  }

  /**
   * Asserts a response arrived within a budget. API-layer perf checks belong
   * here, not at E2E where page rendering muddies the number.
   */
  assertUnder(label: string, elapsedMs: number, budgetMs: number): void {
    if (elapsedMs <= budgetMs) {
      comFunc.reportMessagePass(`${label} completed in ${elapsedMs}ms (budget ${budgetMs}ms)`);
    } else {
      comFunc.reportMessageFail(`${label} took ${elapsedMs}ms, over the ${budgetMs}ms budget`);
    }
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }

  private async send(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    options: RequestOptions,
  ): Promise<APIResponse> {
    const started = Date.now();
    comFunc.reportMessageInfo(`${method} ${this.baseURL}${path}`);
    const response = await this.ctx.fetch(path, {
      method,
      headers: options.headers,
      params: options.params,
      timeout: options.timeout,
      ...(options.data === undefined ? {} : { data: options.data }),
    });
    comFunc.reportMessageInfo(
      `${method} ${path} → ${response.status()} in ${Date.now() - started}ms`,
    );
    return response;
  }
}
