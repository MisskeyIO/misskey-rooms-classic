import { implement, ORPCError } from "@orpc/server";
import { contract, type RoomInfo } from "@misskey-rooms/contract";
import { authMiddleware, type AuthContext } from "./middleware/auth.ts";

interface RoomData extends RoomInfo {}

const os = implement(contract).$context<AuthContext>();

const protectedProcedure = os.use(authMiddleware);

function getRoomKey(userId: string, floor: number): string {
  return `room:${userId}:${floor}`;
}

export const router = os.router({
  getRoom: os.getRoom.handler(async ({ input, context }) => {
    const { userId, floor } = input;

    const data = await context.MISSKEY_ROOMS.get<RoomData>(getRoomKey(userId, floor), "json");

    if (!data) {
      return { roomType: "default", carpetColor: "#85CAF0", furnitures: [] };
    }

    return {
      roomType: data.roomType,
      carpetColor: data.carpetColor,
      furnitures: Array.isArray(data.furnitures) ? data.furnitures : [],
    };
  }),

  saveRoom: protectedProcedure.saveRoom.handler(async ({ input, context }) => {
    if (!context.currentUserId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "ログインが必要です",
      });
    }
    if (context.currentUserId !== input.userId) {
      throw new ORPCError("FORBIDDEN", {
        message: "他のユーザーの部屋は編集できません",
      });
    }

    const { userId, floor, room } = input;

    const roomData: RoomData = {
      roomType: room.roomType,
      carpetColor: room.carpetColor,
      furnitures: room.furnitures,
    };

    await context.MISSKEY_ROOMS.put(getRoomKey(userId, floor), JSON.stringify(roomData));

    return { ok: true as const };
  }),

  getFloors: os.getFloors.handler(async ({ input, context }) => {
    const { userId } = input;
    const prefix = `room:${userId}:`;

    const floors: number[] = [];
    let cursor: string | undefined;

    do {
      const listResult = await context.MISSKEY_ROOMS.list({ prefix, cursor });
      for (const key of listResult.keys) {
        const floorStr = key.name.slice(prefix.length);
        const floor = parseInt(floorStr, 10);
        if (!Number.isNaN(floor)) {
          floors.push(floor);
        }
      }
      cursor = listResult.list_complete ? undefined : listResult.cursor;
    } while (cursor);

    return floors.sort((a, b) => a - b);
  }),

  deleteRoom: protectedProcedure.deleteRoom.handler(async ({ input, context }) => {
    if (!context.currentUserId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "ログインが必要です",
      });
    }
    if (context.currentUserId !== input.userId) {
      throw new ORPCError("FORBIDDEN", {
        message: "他のユーザーの部屋は削除できません",
      });
    }

    const { userId, floor } = input;

    await context.MISSKEY_ROOMS.delete(getRoomKey(userId, floor));

    return { ok: true as const };
  }),

  getUserInfo: os.getUserInfo.handler(async ({ input }) => {
    const { userId } = input;
    const cacheKey = new Request(`https://rooms.misskey.io/user-info/${userId}`);

    const cached = await caches.default.match(cacheKey);
    if (cached) {
      const cachedData = (await cached.json()) as {
        userId: string;
        name: string;
        avatarUrl: string | null;
      };
      return cachedData;
    }

    try {
      const response = await fetch("https://misskey.io/api/users/show", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userId }),
      });

      if (!response.ok) {
        throw new ORPCError("NOT_FOUND", {
          message: "ユーザーが見つかりません",
        });
      }

      const data = (await response.json()) as {
        username: string;
        name: string | null;
        avatarUrl: string | null;
      };

      const userInfo = {
        userId: data.username,
        name: data.name || data.username,
        avatarUrl: data.avatarUrl || null,
      };

      const cacheResponse = new Response(JSON.stringify(userInfo), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=600",
        },
      });
      await caches.default.put(cacheKey, cacheResponse);

      return userInfo;
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "ユーザー情報の取得に失敗しました",
      });
    }
  }),
});
