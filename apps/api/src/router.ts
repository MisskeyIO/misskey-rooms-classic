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

  getRandomUser: os.getRandomUser.handler(async ({ context }) => {
    const prefix = "room:";
    const users = new Set<string>();
    let cursor: string | undefined;

    // KVストアから全ユーザーを収集
    do {
      const listResult = await context.MISSKEY_ROOMS.list({ prefix, cursor });
      for (const key of listResult.keys) {
        const parts = key.name.slice(prefix.length).split(":");
        if (parts.length >= 1) {
          users.add(parts[0]);
        }
      }
      cursor = listResult.list_complete ? undefined : listResult.cursor;
    } while (cursor);

    if (users.size === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: "利用可能なルームがありません",
      });
    }

    const userArray = Array.from(users);
    const randomUserId = userArray[Math.floor(Math.random() * userArray.length)];

    return { userId: randomUserId };
  }),
});
