import { ref, watch, computed } from "vue";
import type { Ref } from "vue";
import { Room } from "../room.ts";
import type { GraphicsQuality } from "../room.ts";
import type { RoomInfo } from "@misskey-rooms/shared";
import { furnitureDefs } from "@misskey-rooms/shared";
import { orpc } from "./useApi.ts";
import { useAuth } from "./useAuth.ts";

interface DialogHandlers {
  showToast: (message: string, type?: "success" | "error") => void;
  showConfirm: (
    message: string,
    options?: { title?: string; confirmText?: string; cancelText?: string },
  ) => Promise<boolean>;
}

const DEV_PREVIEW_USER_ID = "__dev_preview__";

function getParams() {
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  const params = new URLSearchParams(location.search);
  return {
    userId: path || null,
    floor: Number(params.get("floor") ?? "0"),
  };
}

export function useRoom(roomContainer: Ref<HTMLDivElement | null>, dialog: DialogHandlers) {
  const { userId: initUserIdOrNull, floor: initFloor } = getParams();
  const { currentUser } = useAuth();
  const isDevPreview = import.meta.env.DEV && initUserIdOrNull === null;
  const { showToast, showConfirm } = dialog;

  const userId = ref(initUserIdOrNull ?? currentUser.value?.userId ?? null);
  const floor = ref(initFloor);
  const isMyRoom = computed(
    () => userId.value !== null && currentUser.value?.userId === userId.value,
  );
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
    if (initUserIdOrNull === null) {
      if (currentUser.value) {
        userId.value = currentUser.value.userId;
      } else {
        // ログインしていない場合、ランダムなユーザーのルームを取得
        try {
          const { userId: randomUserId } = await orpc.getRandomUser({});
          userId.value = randomUserId;
        } catch (e) {
          console.error("Failed to get random user:", e);
          return;
        }
      }
    }
    try {
      const roomInfo = await orpc.getRoom({ userId: userId.value!, floor: floor.value });
      initRoom(roomInfo);
      const newPath = isDevPreview
        ? `/${floor.value !== 0 ? `?floor=${floor.value}` : ""}`
        : `/${encodeURIComponent(userId.value!)}${floor.value !== 0 ? `?floor=${floor.value}` : ""}`;
      history.replaceState(null, "", newPath);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSave() {
    if (!currentRoom) return;
    try {
      await orpc.saveRoom({
        userId: userId.value!,
        floor: floor.value,
        room: currentRoom.getRoomInfo(),
      });
      showToast("保存しました", "success");
    } catch (e) {
      showToast("保存に失敗しました: " + (e instanceof Error ? e.message : e), "error");
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

  async function clearAll() {
    const confirmed = await showConfirm("全ての家具を削除しますか？", {
      title: "確認",
      confirmText: "削除する",
      cancelText: "キャンセル",
    });
    if (confirmed) {
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
