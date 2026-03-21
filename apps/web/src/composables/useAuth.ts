import { ref, computed } from "vue";

export interface AuthState {
  token: string;
  userId: string;
  name: string;
  picture: string | null;
}

function isValidAuthState(data: unknown): data is AuthState {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.token === "string" &&
    typeof d.userId === "string" &&
    /^[a-zA-Z0-9_-]+$/.test(d.userId) &&
    typeof d.name === "string" &&
    (d.picture === null || (typeof d.picture === "string" && /^https?:\/\//.test(d.picture)))
  );
}

function loadAuthState(): AuthState | null {
  try {
    const stored = localStorage.getItem("misskey_rooms_auth");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!isValidAuthState(parsed)) {
      localStorage.removeItem("misskey_rooms_auth");
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem("misskey_rooms_auth");
    return null;
  }
}

const authState = ref<AuthState | null>(loadAuthState());

export function useAuth() {
  const isLoggedIn = computed(() => authState.value !== null);
  const currentUser = computed(() => authState.value);

  function startLogin(returnTo?: string) {
    const path = returnTo ?? location.pathname;
    location.href = `/auth/login?return_to=${encodeURIComponent(path)}`;
  }

  async function handleJwtCallback(jwt: string): Promise<boolean> {
    try {
      const res = await fetch("/auth/verify-jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt }),
      });
      if (!res.ok) return false;
      const rawData = await res.json();
      if (!isValidAuthState(rawData)) return false;
      authState.value = rawData;
      localStorage.setItem("misskey_rooms_auth", JSON.stringify(rawData));
      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    if (authState.value) {
      try {
        await fetch("/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${authState.value.token}` },
        });
      } catch {
        // ignore
      }
    }
    authState.value = null;
    localStorage.removeItem("misskey_rooms_auth");
  }

  return { isLoggedIn, currentUser, startLogin, handleJwtCallback, logout };
}
