import { router } from "@/main";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class Api {
  async fetch(path: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (response.status === 401) {
      router.navigate({ to: "/auth/sign-in", replace: true });
    }

    return response;
  }
}

export const api = new Api();
