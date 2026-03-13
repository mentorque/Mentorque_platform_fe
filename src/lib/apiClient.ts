/**
 * Authenticated API client for backend. Attaches Bearer token (Firebase or wildcard)
 * so callers don't need to handle auth in every request.
 */

import { getTokenForApi } from "./auth";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getTokenForApi();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(
  path: string,
  init: RequestInit & { body?: object } = {}
): Promise<Response> {
  const { body, ...rest } = init;
  const headers = { ...(await authHeaders()), ...(init.headers || {}) };
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  return fetch(url, {
    ...rest,
    headers,
    ...(body != null && { body: JSON.stringify(body) }),
  });
}

export const apiClient = {
  async get(path: string, init?: RequestInit): Promise<Response> {
    return request(path, { ...init, method: "GET" });
  },

  async post(path: string, body?: object, init?: RequestInit): Promise<Response> {
    return request(path, { ...init, method: "POST", body });
  },

  async patch(path: string, body?: object, init?: RequestInit): Promise<Response> {
    return request(path, { ...init, method: "PATCH", body });
  },

  async put(path: string, body?: object, init?: RequestInit): Promise<Response> {
    return request(path, { ...init, method: "PUT", body });
  },

  async delete(path: string, init?: RequestInit): Promise<Response> {
    return request(path, { ...init, method: "DELETE" });
  },
};
