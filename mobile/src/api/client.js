import { API_URL } from "../config";

// Small fetch wrapper. JSON bodies get a content-type; FormData is sent as-is.
export async function api(path, token, opts = {}) {
  const isForm = opts.body instanceof FormData;
  const r = await fetch(`${API_URL}/api${path}`, {
    ...opts,
    headers: {
      ...(opts.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}
