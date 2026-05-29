const LOCAL_API_BASE_URL = "http://localhost:8080";

export const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG || "demo";

export const resolveApiBaseUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

    if (typeof window !== "undefined") {
        const { hostname } = window.location;
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local")) {
            if (configuredUrl) {
                return configuredUrl;
            }
            return LOCAL_API_BASE_URL;
        }
    }

    if (configuredUrl && configuredUrl.startsWith("/")) {
        return configuredUrl;
    }

    return "/api";
};
