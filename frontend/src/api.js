const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

export const PRODUCTS_ENDPOINT =
  import.meta.env.VITE_PRODUCTS_ENDPOINT || "/api/productos";

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const raw = await response.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" &&
        (data.message || data.error || data.detail)) ||
      (typeof data === "string" && data) ||
      `Error HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}