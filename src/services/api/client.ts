import { tokenStorage as apiTokenStorage } from "@/lib/api/client";
import { config } from "@/config/env";
import type { ApiResponse } from "@/types";

// Re-export tokenStorage so existing imports don't break
export const tokenStorage = apiTokenStorage;

// Export the new api client for use in services
export { api } from "@/lib/api/client";

// Re-export for backward compatibility
export const apiClient = {
  instance: null as any, // Deprecated — use api from @/lib/api
};

export default apiTokenStorage;
