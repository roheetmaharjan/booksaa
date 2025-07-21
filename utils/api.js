// utils/api.js
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

async function apiRequest(method, path, data) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (path) => apiRequest("GET", path),
  post: (path, data) => apiRequest("POST", path, data),
  put: (path, data) => apiRequest("PUT", path, data),
  delete: (path) => apiRequest("DELETE", path),
};
