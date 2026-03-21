import { ORPCError, implement } from "@orpc/server";
import { contract } from "@misskey-rooms/contract";

type Context = { DB: D1Database; currentUserId?: string };

const os = implement(contract).$context<Context>();

export const router = os.router({
  getRoom: os.getRoom.handler(async ({ input, context }) => {
    const { userId, floor } = input;

    const row = await context.DB.prepare(
      "SELECT room_type, carpet_color, furnitures FROM rooms WHERE user_id = ? AND floor = ?",
    )
      .bind(userId, floor)
      .first<{ room_type: string; carpet_color: string; furnitures: string }>();

    if (!row) {
      return { roomType: "default", carpetColor: "#85CAF0", furnitures: [] };
    }

    return {
      roomType: row.room_type,
      carpetColor: row.carpet_color,
      furnitures: JSON.parse(row.furnitures),
    };
  }),

  saveRoom: os.saveRoom.handler(async ({ input, context }) => {
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

    await context.DB.prepare(
      `INSERT INTO rooms (user_id, floor, room_type, carpet_color, furnitures, updated_at)
			 VALUES (?, ?, ?, ?, ?, datetime('now'))
			 ON CONFLICT(user_id, floor) DO UPDATE SET
			   room_type = excluded.room_type,
			   carpet_color = excluded.carpet_color,
			   furnitures = excluded.furnitures,
			   updated_at = datetime('now')`,
    )
      .bind(userId, floor, room.roomType, room.carpetColor, JSON.stringify(room.furnitures))
      .run();

    return { ok: true as const };
  }),

  getFloors: os.getFloors.handler(async ({ input, context }) => {
    const { userId } = input;

    const { results } = await context.DB.prepare(
      "SELECT floor FROM rooms WHERE user_id = ? ORDER BY floor",
    )
      .bind(userId)
      .all<{ floor: number }>();

    return results?.map((r) => r.floor) ?? [];
  }),

  deleteRoom: os.deleteRoom.handler(async ({ input, context }) => {
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

    await context.DB.prepare("DELETE FROM rooms WHERE user_id = ? AND floor = ?")
      .bind(userId, floor)
      .run();

    return { ok: true as const };
  }),
});
