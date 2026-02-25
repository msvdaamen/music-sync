const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class Api {
  fetch(path: string, options?: RequestInit) {
    return fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }
}

export const api = new Api();
