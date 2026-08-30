import axios from "axios";

const SITE_SETTINGS_CACHE_KEY = "rs-site-settings";
const HERO_CONTENT_CACHE_KEY = "rs-hero-content";

export const getCachedSiteSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(SITE_SETTINGS_CACHE_KEY) || "null");
  } catch {
    return null;
  }
};

export const getCachedHeroContent = () => {
  try {
    return JSON.parse(localStorage.getItem(HERO_CONTENT_CACHE_KEY) || "null");
  } catch {
    return null;
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Notify another open website tab when an authenticated admin update succeeds.
// The public site listens for this value and reloads its CMS data automatically.
api.interceptors.response.use((response) => {
  const requestPath = response.config.url?.split("?")[0];
  if (
    ["/site-settings", "/admin/site-settings"].includes(requestPath)
    && response.data?.settings
  ) {
    localStorage.setItem(SITE_SETTINGS_CACHE_KEY, JSON.stringify(response.data.settings));
  }
  if (
    (requestPath === "/hero-content" || requestPath?.startsWith("/hero-content/images"))
    && response.data?.content
  ) {
    localStorage.setItem(HERO_CONTENT_CACHE_KEY, JSON.stringify(response.data.content));
  }

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
