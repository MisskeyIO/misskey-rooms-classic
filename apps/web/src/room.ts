import { v4 as uuid } from "uuid";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import type { Furniture, RoomInfo } from "@misskey-rooms/shared";
import { furnitureDefs } from "@misskey-rooms/shared";

export type GraphicsQuality = "cheep" | "low" | "medium" | "high" | "ultra";

export type RoomOptions = {
  graphicsQuality: GraphicsQuality;
  onChangeSelect: (obj: THREE.Object3D | null) => void;
  useOrthographicCamera: boolean;
  isMyRoom: boolean;
};

export class Room {
  private clock: THREE.Clock;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private controls: OrbitControls;
  private composer: EffectComposer | null;
  private mixers: THREE.AnimationMixer[] = [];
  private furnitureControl!: TransformControls;
  private furnitureControlHelper!: THREE.Object3D;
  private roomInfo: RoomInfo;
  private graphicsQuality: GraphicsQuality;
  private roomObj!: THREE.Object3D;
  private objects: THREE.Object3D[] = [];
  private selectedObject: THREE.Object3D | null = null;
  private onChangeSelect: (obj: THREE.Object3D | null) => void;
  private isTransformMode = false;
  private renderFrameRequestId = 0;
  private container: HTMLElement;
  private colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  private get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  private get furnitures(): Furniture[] {
    return this.roomInfo.furnitures;
  }

  private set furnitures(furnitures: Furniture[]) {
    this.roomInfo.furnitures = furnitures;
  }

  private get enableShadow() {
    return this.graphicsQuality !== "cheep";
  }

  private get usePostFXs() {
    return this.graphicsQuality !== "cheep" && this.graphicsQuality !== "low";
  }

  private get shadowQuality() {
    return this.graphicsQuality === "ultra"
      ? 16384
      : this.graphicsQuality === "high"
        ? 8192
        : this.graphicsQuality === "medium"
          ? 4096
          : this.graphicsQuality === "low"
            ? 1024
            : 0;
  }

  constructor(roomInfo: RoomInfo, container: HTMLElement, options: RoomOptions) {
    this.roomInfo = roomInfo;
    this.graphicsQuality = options.graphicsQuality;
    this.onChangeSelect = options.onChangeSelect;
    this.container = container;

    this.clock = new THREE.Clock(true);

    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    //#region Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      stencil: false,
      alpha: false,
      powerPreference:
        this.graphicsQuality === "ultra"
          ? "high-performance"
          : this.graphicsQuality === "high"
            ? "high-performance"
            : this.graphicsQuality === "medium"
              ? "default"
              : "low-power",
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.autoClear = false;
    this.applyRendererClearColor();
    this.renderer.shadowMap.enabled = this.enableShadow;
    this.renderer.shadowMap.type =
      this.graphicsQuality === "ultra"
        ? THREE.PCFSoftShadowMap
        : this.graphicsQuality === "high"
          ? THREE.PCFSoftShadowMap
          : this.graphicsQuality === "medium"
            ? THREE.PCFShadowMap
            : THREE.BasicShadowMap;

    container.appendChild(this.canvas);

    this.colorSchemeMediaQuery.addEventListener("change", this.onColorSchemeChange);
    //#endregion

    //#region Camera
    this.camera = options.useOrthographicCamera
      ? new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -10, 10)
      : new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    if (options.useOrthographicCamera) {
      this.camera.position.set(2, 2, 2);
      (this.camera as THREE.OrthographicCamera).zoom = 100;
      this.camera.updateProjectionMatrix();
    } else {
      this.camera.position.set(5, 2, 5);
    }

    this.scene.add(this.camera);
    //#endregion

    //#region Lighting
    // Three.js r155+ uses physically-based light units by default.
    // SpotLight intensity is now in candela; AmbientLight/HemisphereLight are unaffected.

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.8);
    hemiLight.position.set(0, 8, 0);
    this.scene.add(hemiLight);

    if (this.graphicsQuality !== "cheep") {
      const roomLight = new THREE.SpotLight(0xffffff, 180);
      roomLight.decay = 2;
      roomLight.position.set(0, 8, 0);
      roomLight.castShadow = this.enableShadow;
      roomLight.shadow.bias = -0.0001;
      roomLight.shadow.mapSize.width = this.shadowQuality;
      roomLight.shadow.mapSize.height = this.shadowQuality;
      roomLight.shadow.camera.near = 0.1;
      roomLight.shadow.camera.far = 9;
      roomLight.shadow.camera.fov = 45;
      this.scene.add(roomLight);
      this.scene.add(roomLight.target);
    }

    const outLight1 = new THREE.SpotLight(0xffffff, 400);
    outLight1.decay = 2;
    outLight1.position.set(9, 3, -2);
    outLight1.castShadow = this.enableShadow;
    outLight1.shadow.bias = -0.001;
    outLight1.shadow.mapSize.width = this.shadowQuality;
    outLight1.shadow.mapSize.height = this.shadowQuality;
    outLight1.shadow.camera.near = 6;
    outLight1.shadow.camera.far = 15;
    outLight1.shadow.camera.fov = 45;
    this.scene.add(outLight1);
    this.scene.add(outLight1.target);

    const outLight2 = new THREE.SpotLight(0xffffff, 200);
    outLight2.decay = 2;
    outLight2.position.set(-2, 3, 9);
    outLight2.castShadow = false;
    outLight2.shadow.bias = -0.001;
    outLight2.shadow.camera.near = 6;
    outLight2.shadow.camera.far = 15;
    outLight2.shadow.camera.fov = 45;
    this.scene.add(outLight2);
    this.scene.add(outLight2.target);
    //#endregion

    //#region OrbitControls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 1, 0);
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 3.0;
    this.controls.enablePan = options.isMyRoom;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minAzimuthAngle = 0;
    this.controls.maxAzimuthAngle = Math.PI / 2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.6;
    // 元の Misskey と同じ配置: 左=ズーム, 中=パン, 右=回転
    this.controls.mouseButtons.LEFT = THREE.MOUSE.DOLLY;
    this.controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
    this.controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    //#endregion

    //#region Post FX
    if (!this.usePostFXs) {
      this.composer = null;
    } else {
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
      });

      const fxaa = new ShaderPass(FXAAShader);
      fxaa.uniforms["resolution"].value = new THREE.Vector2(1 / width, 1 / height);

      this.composer = new EffectComposer(this.renderer, renderTarget);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      if (this.graphicsQuality === "ultra") {
        this.composer.addPass(
          new UnrealBloomPass(new THREE.Vector2(width, height), 0.25, 0.4, 0.85),
        );
      }
      this.composer.addPass(fxaa);
    }
    //#endregion

    //#region TransformControls (furniture move/rotate)
    if (options.isMyRoom) {
      this.furnitureControl = new TransformControls(this.camera, this.canvas);

      // Three.js r160+: TransformControls extends Controls, NOT Object3D.
      // The visual gizmo must be obtained via getHelper() and added to the scene.
      this.furnitureControlHelper = this.furnitureControl.getHelper();
      this.scene.add(this.furnitureControlHelper);

      // Disable OrbitControls while dragging the gizmo
      this.furnitureControl.addEventListener("dragging-changed", (event) => {
        this.controls.enabled = !(event as unknown as { value: boolean }).value;
      });

      // Hover highlight & click selection
      this.canvas.addEventListener("pointermove", (ev) => this.onPointerMove(ev));
      this.canvas.addEventListener("pointerdown", (ev) => this.onPointerDown(ev));
    }
    //#endregion

    // Load room & furnitures
    this.loadRoom();
    for (const furniture of this.furnitures) {
      void this.loadFurniture(furniture).then((obj) => {
        this.scene.add(obj);
        this.objects.push(obj);
      });
    }

    // Start render loop
    if (this.usePostFXs) {
      this.renderWithPostFXs();
    } else {
      this.renderWithoutPostFXs();
    }

    // Resize handler
    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.composer) {
      this.composer.setSize(w, h);
    }
  };

  private onColorSchemeChange = () => {
    this.applyRendererClearColor();
  };

  private applyRendererClearColor() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--canvas-bg").trim();
    this.renderer.setClearColor(new THREE.Color(value || "#232323"));
  }

  //#region Render loop
  private renderWithoutPostFXs = () => {
    this.renderFrameRequestId = window.requestAnimationFrame(this.renderWithoutPostFXs);
    const delta = this.clock.getDelta();
    for (const mixer of this.mixers) {
      mixer.update(delta);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private renderWithPostFXs = () => {
    this.renderFrameRequestId = window.requestAnimationFrame(this.renderWithPostFXs);
    const delta = this.clock.getDelta();
    for (const mixer of this.mixers) {
      mixer.update(delta);
    }
    this.controls.update();
    this.renderer.clear();
    this.composer!.render();
  };
  //#endregion

  //#region Asset loading
  private loadRoom() {
    const type = this.roomInfo.roomType;
    new GLTFLoader().load(`/room/rooms/${type}/${type}.glb`, (gltf) => {
      gltf.scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.receiveShadow = this.enableShadow;
        if (
          this.graphicsQuality !== "cheep" &&
          (child.material as THREE.MeshStandardMaterial).map
        ) {
          (child.material as THREE.MeshStandardMaterial).map!.anisotropy = 8;
        }
      });
      gltf.scene.position.set(0, 0, 0);
      this.scene.add(gltf.scene);
      this.roomObj = gltf.scene;
      if (this.roomInfo.roomType === "default") {
        this.applyCarpetColor();
      }
    });
  }

  private loadFurniture(furniture: Furniture): Promise<THREE.Object3D> {
    const def = furnitureDefs.find((d) => d.id === furniture.type);
    return new Promise<THREE.Object3D>((resolve, reject) => {
      new GLTFLoader().load(
        `/room/furnitures/${furniture.type}/${furniture.type}.glb`,
        (gltf) => {
          const model = gltf.scene;

          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            this.mixers.push(mixer);
            for (const clip of gltf.animations) {
              mixer.clipAction(clip).play();
            }
          }

          model.name = furniture.id;
          model.position.set(furniture.position.x, furniture.position.y, furniture.position.z);
          model.rotation.set(furniture.rotation.x, furniture.rotation.y, furniture.rotation.z);

          model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.castShadow = this.enableShadow;
            child.receiveShadow = this.enableShadow;
            (child.material as THREE.MeshStandardMaterial).metalness = 0;
            if (
              (child.material as THREE.MeshStandardMaterial).map &&
              this.graphicsQuality !== "cheep"
            ) {
              (child.material as THREE.MeshStandardMaterial).map!.anisotropy = 8;
            }
          });

          if (def?.color) {
            this.applyCustomColor(model);
          }
          if (def?.texture) {
            this.applyCustomTexture(model);
          }

          resolve(model);
        },
        undefined,
        reject,
      );
    });
  }
  //#endregion

  //#region Material customization
  private applyCarpetColor() {
    this.roomObj.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (child.material && (child.material as THREE.MeshStandardMaterial).name === "Carpet") {
        const colorHex = parseInt(this.roomInfo.carpetColor.substring(1), 16);
        (child.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
      }
    });
  }

  private applyCustomColor(model: THREE.Object3D) {
    const furniture = this.furnitures.find((f) => f.id === model.name);
    if (!furniture) return;
    const def = furnitureDefs.find((d) => d.id === furniture.type);
    if (!def?.color) return;
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      for (const t of Object.keys(def.color!)) {
        if (!child.material || (child.material as THREE.MeshStandardMaterial).name !== t) continue;
        const prop = def.color![t];
        const val = furniture.props?.[prop];
        if (val == null) continue;
        const colorHex = parseInt(val.substring(1), 16);
        (child.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
      }
    });
  }

  private applyCustomTexture(model: THREE.Object3D) {
    const furniture = this.furnitures.find((f) => f.id === model.name);
    if (!furniture) return;
    const def = furnitureDefs.find((d) => d.id === furniture.type);
    if (!def?.texture) return;

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      for (const t of Object.keys(def.texture!)) {
        if (child.name !== t) continue;
        const prop = def.texture![t].prop;
        const val = furniture.props?.[prop];
        if (val == null) continue;

        const canvas = document.createElement("canvas");
        canvas.height = 1024;
        canvas.width = 1024;

        child.material = new THREE.MeshLambertMaterial({
          emissive: 0x111111,
          side: THREE.DoubleSide,
          alphaTest: 0.5,
        });

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const uvInfo = def.texture![t].uv;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            uvInfo.x,
            uvInfo.y,
            uvInfo.width,
            uvInfo.height,
          );

          const texture = new THREE.Texture(canvas);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.anisotropy = 16;
          texture.flipY = false;

          (child.material as THREE.MeshLambertMaterial).map = texture;
          (child.material as THREE.MeshLambertMaterial).needsUpdate = true;
          texture.needsUpdate = true;
        };
        img.src = val;
      }
    });
  }
  //#endregion

  //#region Pointer interaction (selection / hover)
  private getNDC(ev: PointerEvent): THREE.Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(x, y);
  }

  private onPointerMove(ev: PointerEvent) {
    if (this.isTransformMode) return;

    const ndc = this.getNDC(ev);
    this.camera.updateMatrixWorld();
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);
    const intersects = raycaster.intersectObjects(this.objects, true);

    // Reset hover highlight (skip selected object)
    for (const object of this.objects) {
      if (this.isSelectedObject(object)) continue;
      this.setEmissive(object, 0x000000);
    }

    if (intersects.length > 0) {
      const intersected = this.getRoot(intersects[0].object);
      if (this.isSelectedObject(intersected)) return;
      this.setEmissive(intersected, 0x191919);
    }
  }

  private onPointerDown(ev: PointerEvent) {
    if (this.isTransformMode) return;
    if (ev.target !== this.canvas || ev.button !== 0) return;

    const ndc = this.getNDC(ev);
    this.camera.updateMatrixWorld();
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);
    const intersects = raycaster.intersectObjects(this.objects, true);

    // Reset all emissive
    for (const object of this.objects) {
      this.setEmissive(object, 0x000000);
    }

    if (intersects.length > 0) {
      const selectedObj = this.getRoot(intersects[0].object);
      this.selectFurniture(selectedObj);
    } else {
      this.selectedObject = null;
      this.onChangeSelect(null);
    }
  }

  /**
   * Walk up the scene graph from a child mesh to find the furniture root
   * (direct child of the scene).
   */
  private getRoot(obj: THREE.Object3D): THREE.Object3D {
    let current = obj;
    while (current.parent && current.parent !== this.scene) {
      current = current.parent;
    }
    return current;
  }

  private isSelectedObject(obj: THREE.Object3D): boolean {
    return this.selectedObject != null && obj.name === this.selectedObject.name;
  }

  private selectFurniture(obj: THREE.Object3D) {
    this.selectedObject = obj;
    this.onChangeSelect(obj);
    this.setEmissive(obj, 0xff0000);
  }

  private setEmissive(obj: THREE.Object3D, hex: number) {
    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.setHex(hex);
      }
    });
  }
  //#endregion

  //#region Public API
  public enterTransformMode(type: "translate" | "rotate") {
    if (!this.selectedObject) return;
    this.isTransformMode = true;
    this.furnitureControl.setMode(type);
    this.furnitureControl.attach(this.selectedObject);
  }

  public exitTransformMode() {
    this.isTransformMode = false;
    this.furnitureControl.detach();
    this.controls.enabled = true;
  }

  public updateProp(key: string, value: string) {
    if (!this.selectedObject) return;
    const furniture = this.furnitures.find((f) => f.id === this.selectedObject!.name);
    if (!furniture) return;
    if (furniture.props == null) furniture.props = {};
    furniture.props[key] = value;
    this.applyCustomColor(this.selectedObject);
    this.applyCustomTexture(this.selectedObject);
  }

  public addFurniture(type: string) {
    const furniture: Furniture = {
      id: uuid(),
      type,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    };

    this.furnitures.push(furniture);
    void this.loadFurniture(furniture).then((obj) => {
      this.scene.add(obj);
      this.objects.push(obj);
    });
  }

  public removeFurniture() {
    if (!this.selectedObject) return;
    this.exitTransformMode();
    const obj = this.selectedObject;
    this.scene.remove(obj);
    this.objects = this.objects.filter((o) => o.name !== obj.name);
    this.furnitures = this.furnitures.filter((f) => f.id !== obj.name);
    this.selectedObject = null;
    this.onChangeSelect(null);
  }

  public removeAllFurnitures() {
    this.exitTransformMode();
    for (const obj of this.objects) {
      this.scene.remove(obj);
    }
    this.objects = [];
    this.furnitures = [];
    this.selectedObject = null;
    this.onChangeSelect(null);
  }

  public updateCarpetColor(color: string) {
    this.roomInfo.carpetColor = color;
    this.applyCarpetColor();
  }

  public changeRoomType(type: string) {
    this.roomInfo.roomType = type;
    this.scene.remove(this.roomObj);
    this.loadRoom();
  }

  public getRoomInfo(): RoomInfo {
    for (const obj of this.objects) {
      const furniture = this.furnitures.find((f) => f.id === obj.name);
      if (!furniture) continue;
      furniture.position.x = obj.position.x;
      furniture.position.y = obj.position.y;
      furniture.position.z = obj.position.z;
      furniture.rotation.x = obj.rotation.x;
      furniture.rotation.y = obj.rotation.y;
      furniture.rotation.z = obj.rotation.z;
    }
    return this.roomInfo;
  }

  public getSelectedObject() {
    return this.selectedObject;
  }

  public findFurnitureById(id: string) {
    return this.furnitures.find((f) => f.id === id);
  }

  public destroy() {
    window.cancelAnimationFrame(this.renderFrameRequestId);
    window.removeEventListener("resize", this.onResize);
    this.colorSchemeMediaQuery.removeEventListener("change", this.onColorSchemeChange);
    if (this.furnitureControl) {
      this.furnitureControl.detach();
      this.furnitureControl.dispose();
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
  //#endregion
}
