import { ref, watch, computed } from "vue";
import type { Ref } from "vue";
import { Room } from "../room.ts";
import type { GraphicsQuality } from "../room.ts";
import type { RoomInfo } from "@misskey-rooms/shared";
import { furnitureDefs } from "@misskey-rooms/shared";
import { orpc } from "./useApi.ts";
import { useAuth } from "./useAuth.ts";

function getParams() {
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  const params = new URLSearchParams(location.search);
  return {
    userId: path || "default",
    floor: Number(params.get("floor") ?? "0"),
  };
}

export function useRoom(roomContainer: Ref<HTMLDivElement | null>) {
  const { userId: initUserId, floor: initFloor } = getParams();
  const { currentUser } = useAuth();

  const userId = ref(initUserId);
  const floor = ref(initFloor);
  const isMyRoom = computed(() => currentUser.value?.userId === userId.value);
  const quality = ref<GraphicsQuality>("medium");
  const roomType = ref("default");
  const carpetColor = ref("#85CAF0");
  const objectSelected = ref(false);
  const selectedFurnitureName = ref("");
  const selectedFurnitureProps = ref<Record<string, string> | null>(null);
  const selectedFurnitureDef = ref<(typeof furnitureDefs)[number] | null>(null);
  const isTranslateMode = ref(false);
  const isRotateMode = ref(false);

  let currentRoom: Room | null = null;

  function initRoom(roomInfo: RoomInfo) {
    if (currentRoom) {
      currentRoom.destroy();
      roomContainer.value!.replaceChildren();
    }

    roomType.value = roomInfo.roomType;
    carpetColor.value = roomInfo.carpetColor;

    currentRoom = new Room(roomInfo, roomContainer.value!, {
      graphicsQuality: quality.value,
      isMyRoom: isMyRoom.value,
      useOrthographicCamera: false,
      onChangeSelect: (obj) => {
        if (obj) {
          objectSelected.value = true;
          const f = currentRoom!.findFurnitureById(obj.name);
          if (f) {
            selectedFurnitureName.value = f.type;
            selectedFurnitureDef.value = furnitureDefs.find((d) => d.id === f.type) ?? null;
            selectedFurnitureProps.value = f.props ? { ...f.props } : null;
          }
        } else {
          objectSelected.value = false;
          selectedFurnitureName.value = "";
          selectedFurnitureDef.value = null;
          selectedFurnitureProps.value = null;
          isTranslateMode.value = false;
          isRotateMode.value = false;
        }
      },
    });
  }

  async function loadRoom() {
    try {
      const roomInfo = await orpc.getRoom({ userId: userId.value, floor: floor.value });
      initRoom(roomInfo);
      const newPath = `/${encodeURIComponent(userId.value)}${floor.value !== 0 ? `?floor=${floor.value}` : ""}`;
      history.replaceState(null, "", newPath);
    } catch (e) {
      console.error(e);
      initRoom({ roomType: "default", carpetColor: "#85CAF0", furnitures: [] });
    }
  }

  async function handleSave() {
    if (!currentRoom) return;
    try {
      await orpc.saveRoom({
        userId: userId.value,
        floor: floor.value,
        room: currentRoom.getRoomInfo(),
      });
      alert("保存しました");
    } catch (e) {
      alert("保存に失敗しました: " + (e instanceof Error ? e.message : e));
    }
  }

  function addFurniture(id: string) {
    currentRoom?.addFurniture(id);
  }

  function translate() {
    if (isTranslateMode.value) {
      exitTransform();
    } else {
      isRotateMode.value = false;
      isTranslateMode.value = true;
      currentRoom?.enterTransformMode("translate");
    }
  }

  function rotate() {
    if (isRotateMode.value) {
      exitTransform();
    } else {
      isTranslateMode.value = false;
      isRotateMode.value = true;
      currentRoom?.enterTransformMode("rotate");
    }
  }

  function exitTransform() {
    isTranslateMode.value = false;
    isRotateMode.value = false;
    currentRoom?.exitTransformMode();
  }

  function removeFurniture() {
    isTranslateMode.value = false;
    isRotateMode.value = false;
    currentRoom?.removeFurniture();
  }

  function clearAll() {
    if (confirm("全ての家具を削除しますか？")) {
      currentRoom?.removeAllFurnitures();
    }
  }

  function updateProp(key: string, value: string) {
    currentRoom?.updateProp(key, value);
  }

  async function changeFloor(delta: number) {
    floor.value += delta;
    await loadRoom();
  }

  function destroy() {
    currentRoom?.destroy();
    currentRoom = null;
  }

  watch(quality, () => {
    if (!currentRoom) return;
    const info = currentRoom.getRoomInfo();
    initRoom(info);
  });

  watch(isMyRoom, () => {
    if (!currentRoom) return;
    const info = currentRoom.getRoomInfo();
    initRoom(info);
  });

  watch(roomType, (type) => {
    currentRoom?.changeRoomType(type);
  });

  watch(carpetColor, (color) => {
    currentRoom?.updateCarpetColor(color);
  });

  return {
    userId,
    floor,
    quality,
    roomType,
    carpetColor,
    objectSelected,
    selectedFurnitureName,
    selectedFurnitureProps,
    selectedFurnitureDef,
    isTranslateMode,
    isRotateMode,
    isMyRoom,
    loadRoom,
    handleSave,
    addFurniture,
    translate,
    rotate,
    exitTransform,
    removeFurniture,
    clearAll,
    updateProp,
    changeFloor,
    destroy,
  };
}
