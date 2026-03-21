import { ref, computed } from "vue";

export interface AuthState {
  token: string;
  userId: string;
  name: string;
  picture: string | null;
}

function loadAuthState(): AuthState | null {
  try {
    const stored = localStorage.getItem("misskey_rooms_auth");
    return stored ? (JSON.parse(stored) as AuthState) : null;
  } catch {
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
      const data = (await res.json()) as AuthState;
      authState.value = data;
      localStorage.setItem("misskey_rooms_auth", JSON.stringify(data));
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
