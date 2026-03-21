export type FurnitureDef = {
  id: string;
  name: string;
  place: "floor" | "wall";
  props?: Record<string, "image" | "color">;
  color?: Record<string, string>;
  texture?: Record<
    string,
    {
      prop: string;
      uv: { x: number; y: number; width: number; height: number };
    }
  >;
};

export const furnitureDefs: FurnitureDef[] = [
  { id: "milk", name: "牛乳パック", place: "floor" },
  { id: "bed", name: "ベッド", place: "floor" },
  {
    id: "low-table",
    name: "ローテーブル",
    place: "floor",
    props: { color: "color" },
    color: { Table: "color" },
  },
  {
    id: "desk",
    name: "デスク",
    place: "floor",
    props: { color: "color" },
    color: { Board: "color" },
  },
  {
    id: "chair",
    name: "椅子",
    place: "floor",
    props: { color: "color" },
    color: { Chair: "color" },
  },
  {
    id: "chair2",
    name: "椅子2",
    place: "floor",
    props: { color1: "color", color2: "color" },
    color: { Cushion: "color1", Leg: "color2" },
  },
  { id: "fan", name: "扇風機", place: "wall" },
  { id: "pc", name: "PC", place: "floor" },
  { id: "plant", name: "植物", place: "floor" },
  { id: "plant2", name: "植物2", place: "floor" },
  { id: "eraser", name: "消しゴム", place: "floor" },
  { id: "pencil", name: "鉛筆", place: "floor" },
  { id: "pudding", name: "プリン", place: "floor" },
  { id: "cardboard-box", name: "段ボール箱", place: "floor" },
  { id: "cardboard-box2", name: "段ボール箱2", place: "floor" },
  { id: "cardboard-box3", name: "段ボール箱3", place: "floor" },
  { id: "book", name: "本", place: "floor", props: { color: "color" }, color: { Cover: "color" } },
  { id: "book2", name: "本2", place: "floor" },
  { id: "piano", name: "ピアノ", place: "floor" },
  { id: "facial-tissue", name: "ティッシュ", place: "floor" },
  { id: "server", name: "サーバー", place: "floor" },
  { id: "moon", name: "月", place: "floor" },
  { id: "corkboard", name: "コルクボード", place: "wall" },
  {
    id: "mousepad",
    name: "マウスパッド",
    place: "floor",
    props: { color: "color" },
    color: { Pad: "color" },
  },
  {
    id: "monitor",
    name: "モニター",
    place: "floor",
    props: { screen: "image" },
    texture: { Screen: { prop: "screen", uv: { x: 0, y: 434, width: 1024, height: 588 } } },
  },
  {
    id: "tv",
    name: "テレビ",
    place: "floor",
    props: { screen: "image" },
    texture: { Screen: { prop: "screen", uv: { x: 0, y: 434, width: 1024, height: 588 } } },
  },
  { id: "keyboard", name: "キーボード", place: "floor" },
  {
    id: "carpet-stripe",
    name: "ストライプカーペット",
    place: "floor",
    props: { color1: "color", color2: "color" },
    color: { CarpetAreaA: "color1", CarpetAreaB: "color2" },
  },
  { id: "mat", name: "マット", place: "floor", props: { color: "color" }, color: { Mat: "color" } },
  {
    id: "color-box",
    name: "カラーボックス",
    place: "floor",
    props: { color: "color" },
    color: { main: "color" },
  },
  { id: "wall-clock", name: "壁時計", place: "wall" },
  {
    id: "cube",
    name: "キューブ",
    place: "floor",
    props: { color: "color" },
    color: { Cube: "color" },
  },
  {
    id: "photoframe",
    name: "フォトフレーム",
    place: "wall",
    props: { photo: "image", color: "color" },
    texture: { Photo: { prop: "photo", uv: { x: 0, y: 342, width: 1024, height: 683 } } },
    color: { Frame: "color" },
  },
  {
    id: "pinguin",
    name: "ペンギン",
    place: "floor",
    props: { body: "color", belly: "color" },
    color: { Body: "body", Belly: "belly" },
  },
  { id: "rubik-cube", name: "ルービックキューブ", place: "floor" },
  {
    id: "poster-h",
    name: "ポスター(横)",
    place: "wall",
    props: { picture: "image" },
    texture: { Poster: { prop: "picture", uv: { x: 0, y: 277, width: 1024, height: 745 } } },
  },
  {
    id: "poster-v",
    name: "ポスター(縦)",
    place: "wall",
    props: { picture: "image" },
    texture: { Poster: { prop: "picture", uv: { x: 0, y: 0, width: 745, height: 1024 } } },
  },
  {
    id: "sofa",
    name: "ソファ",
    place: "floor",
    props: { color: "color" },
    color: { Sofa: "color" },
  },
  {
    id: "spiral",
    name: "螺旋階段",
    place: "floor",
    props: { color: "color" },
    color: { Step: "color" },
  },
  { id: "bin", name: "ゴミ箱", place: "floor", props: { color: "color" }, color: { Bin: "color" } },
  { id: "cup-noodle", name: "カップ麺", place: "floor" },
  {
    id: "holo-display",
    name: "ホロディスプレイ",
    place: "floor",
    props: { image: "image" },
    texture: {
      Image_Front: { prop: "image", uv: { x: 0, y: 0, width: 1024, height: 1024 } },
      Image_Back: { prop: "image", uv: { x: 0, y: 0, width: 1024, height: 1024 } },
    },
  },
  { id: "energy-drink", name: "エナジードリンク", place: "floor" },
];
