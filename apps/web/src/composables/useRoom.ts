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

type RoomRouteState = {
  userId: string | null;
  floor: number;
};

function normalizeFloor(value: string | null): number {
  const parsed = Number(value ?? "0");
  return Number.isInteger(parsed) ? parsed : 0;
}

function getRouteState(): RoomRouteState {
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  const params = new URLSearchParams(location.search);
  return {
    userId: path || null,
    floor: normalizeFloor(params.get("floor")),
  };
}

function buildRoomPath(userId: string, floor: number): string {
  return `/${encodeURIComponent(userId)}${floor !== 0 ? `?floor=${floor}` : ""}`;
}

export function useRoom(roomContainer: Ref<HTMLDivElement | null>, dialog: DialogHandlers) {
  const initialRoute = getRouteState();
  const { currentUser } = useAuth();
  const { showToast, showConfirm } = dialog;

  const userId = ref(initialRoute.userId);
  const floor = ref(initialRoute.floor);
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
  let loadSequence = 0;
  const handlePopState = () => {
    void loadRoom();
  };

  async function initRoom(roomInfo: RoomInfo) {
    if (currentRoom) {
      currentRoom.destroy();
      roomContainer.value!.replaceChildren();
    }

    roomType.value = roomInfo.roomType;
    carpetColor.value = roomInfo.carpetColor;

    let user: { id: string; username: string; avatarUrl: string | null } | undefined;
    if (userId.value) {
      try {
        const userInfo = await orpc.getUserInfo({ userId: userId.value });
        user = {
          id: userInfo.userId,
          username: userInfo.name || userInfo.userId,
          avatarUrl: userInfo.avatarUrl,
        };
      } catch (e) {
        console.error("Failed to fetch user info:", e);
      }
    }

    currentRoom = new Room(roomInfo, roomContainer.value!, {
      graphicsQuality: quality.value,
      isMyRoom: isMyRoom.value,
      useOrthographicCamera: true,
      user,
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

  function syncRoute(route: RoomRouteState) {
    userId.value = route.userId;
    floor.value = route.floor;
  }

  function updateUrl() {
    if (!userId.value) return;
    history.replaceState(null, "", buildRoomPath(userId.value, floor.value));
  }

  async function loadRoom() {
    const sequence = ++loadSequence;
    syncRoute(getRouteState());

    if (userId.value === null && currentUser.value === null) {
      try {
        const { userId: randomUserId } = await orpc.getRandomUser({});
        if (sequence !== loadSequence) return;
        userId.value = randomUserId;
        updateUrl();
      } catch (e) {
        console.error("Failed to get random user:", e);
        return;
      }
    } else if (userId.value === null && currentUser.value !== null) {
      userId.value = currentUser.value.userId;
      updateUrl();
    }

    try {
      const resolvedUserId = userId.value;
      if (!resolvedUserId) return;

      const roomInfo = await orpc.getRoom({ userId: resolvedUserId, floor: floor.value });
      if (sequence !== loadSequence) return;

      await initRoom(roomInfo);
      updateUrl();
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
    if (userId.value) {
      history.replaceState(null, "", buildRoomPath(userId.value, floor.value));
    }
    await loadRoom();
  }

  function destroy() {
    window.removeEventListener("popstate", handlePopState);
    currentRoom?.destroy();
    currentRoom = null;
  }

  window.addEventListener("popstate", handlePopState);

  watch(quality, () => {
    if (!currentRoom) return;
    const info = currentRoom.getRoomInfo();
    void initRoom(info);
  });

  watch(isMyRoom, () => {
    if (!currentRoom) return;
    const info = currentRoom.getRoomInfo();
    void initRoom(info);
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
