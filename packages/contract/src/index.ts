import { oc } from "@orpc/contract";
import { z } from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const furnitureSchema = z.object({
  id: z.string().max(50),
  type: z.string().max(50),
  position: positionSchema,
  rotation: positionSchema,
  props: z
    .record(z.string().max(50), z.string().max(1024))
    .optional()
    .refine((props) => !props || Object.keys(props).length <= 10, {
      message: "Too many properties",
    }),
});

export const roomInfoSchema = z.object({
  roomType: z.string().max(50),
  carpetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  furnitures: z.array(furnitureSchema).max(100),
});

export type RoomInfo = z.infer<typeof roomInfoSchema>;

export const contract = {
  getRoom: oc
    .input(z.object({ userId: z.string(), floor: z.number().int().default(0) }))
    .output(roomInfoSchema),

  saveRoom: oc
    .input(
      z.object({
        userId: z.string(),
        floor: z.number().int().default(0),
        room: roomInfoSchema,
      }),
    )
    .output(z.object({ ok: z.literal(true) })),

  getFloors: oc.input(z.object({ userId: z.string() })).output(z.array(z.number().int())),

  deleteRoom: oc
    .input(z.object({ userId: z.string(), floor: z.number().int().default(0) }))
    .output(z.object({ ok: z.literal(true) })),

  getRandomUser: oc.input(z.object({})).output(z.object({ userId: z.string() })),

  getUserInfo: oc.input(z.object({ userId: z.string() })).output(
    z.object({
      userId: z.string(),
      name: z.string(),
      avatarUrl: z.string().nullable(),
    }),
  ),
};
