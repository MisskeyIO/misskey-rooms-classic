<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const props = defineProps<{ furnitureId: string }>();

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let rafId = 0;
let isVisible = false;
let observer: IntersectionObserver | null = null;

function startLoop() {
  if (rafId || !isVisible) return;
  const tick = () => {
    rafId = requestAnimationFrame(tick);
    controls?.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  };
  tick();
}

function stopLoop() {
  cancelAnimationFrame(rafId);
  rafId = 0;
}

function buildScene(id: string) {
  if (!canvas.value) return;

  stopLoop();

  const W = canvas.value.clientWidth || 120;
  const H = canvas.value.clientHeight || 120;

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  renderer.setSize(W, H, false);

  controls?.dispose();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 2.5);
  dir.position.set(3, 5, 3);
  scene.add(dir);

  controls = new OrbitControls(camera, canvas.value);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 4;

  new GLTFLoader().load(`/room/furnitures/${id}/${id}.glb`, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
    const dist = maxDim * 2;

    camera!.position.set(center.x + dist, center.y + dist * 0.6, center.z + dist);
    camera!.lookAt(center);
    controls!.target.copy(center);
    controls!.update();

    scene!.add(model);
    if (isVisible) startLoop();
  });
}

watch(
  () => props.furnitureId,
  (id) => {
    buildScene(id);
  },
);

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false;
      if (isVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(canvas.value!);
  buildScene(props.furnitureId);
});

onBeforeUnmount(() => {
  stopLoop();
  observer?.disconnect();
  controls?.dispose();
  renderer?.dispose();
  renderer = null;
});
</script>

<template>
  <canvas ref="canvas" class="preview-canvas" />
</template>

<style scoped>
.preview-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
