import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { contract } from "@misskey-rooms/contract";

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem("misskey_rooms_auth");
    if (stored) {
      const { token } = JSON.parse(stored) as { token: string };
      return token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

const link = new RPCLink({
  url: `${window.location.origin}/rpc`,
  adapterInterceptors: [
    (options) => {
      const token = getAuthToken();
      if (!token) return options.next(options);
      const newRequest = new Request(options.request, {
        headers: new Headers({
          ...Object.fromEntries(options.request.headers.entries()),
          Authorization: `Bearer ${token}`,
        }),
      });
      return options.next({ ...options, request: newRequest });
    },
  ],
});

export const orpc: ContractRouterClient<typeof contract> = createORPCClient(link);
