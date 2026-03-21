export type RoomInfo = {
  roomType: string;
  carpetColor: string;
  furnitures: Furniture[];
};

export type Furniture = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  props?: Record<string, string>;
};
