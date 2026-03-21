import { oc } from "@orpc/contract";
import { z } from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const furnitureSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: positionSchema,
  rotation: positionSchema,
  props: z.record(z.string(), z.string()).optional(),
});

export const roomInfoSchema = z.object({
  roomType: z.string(),
  carpetColor: z.string(),
  furnitures: z.array(furnitureSchema),
});

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
};
