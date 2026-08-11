import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Notify another open website tab when an authenticated admin update succeeds.
// The public site listens for this value and reloads its CMS data automatically.
api.interceptors.response.use((response) => {
  const method = response.config.method?.toLowerCase();
  const headers = response.config.headers;
  const hasAuthorization = typeof headers?.get === "function"
    ? headers.get("Authorization")
    : headers?.Authorization;

  if (hasAuthorization && ["post", "put", "patch", "delete"].includes(method)) {
    localStorage.setItem("rs-content-updated", String(Date.now()));
  }

  return response;
});

export default api;
