import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { contract } from "@misskey-rooms/contract";

const link = new RPCLink({ url: "/rpc" });

export const orpc: ContractRouterClient<typeof contract> = createORPCClient(link);
