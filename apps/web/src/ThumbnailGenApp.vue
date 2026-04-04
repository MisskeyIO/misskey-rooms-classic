<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const furnitureId = new URLSearchParams(location.search).get("id") ?? "";
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

onMounted(() => {
  if (!canvas.value || !furnitureId) return;

  const W = 200;
  const H = 200;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(2);
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 2.5);
  dir.position.set(3, 5, 3);
  scene.add(dir);

  // Use a dedicated LoadingManager so we know when ALL assets
  // (including externally-referenced textures like milk.png) are loaded.
  const manager = new THREE.LoadingManager();

  new GLTFLoader(manager).load(`/room/furnitures/${furnitureId}/${furnitureId}.glb`, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
    const dist = maxDim * 2;

    camera.position.set(center.x + dist, center.y + dist * 0.6, center.z + dist);
    camera.lookAt(center);

    scene.add(model);
  });

  // onLoad fires only after every asset tracked by this manager is done,
  // including all textures triggered during GLTF parsing.
  manager.onLoad = () => {
    renderer.render(scene, camera);
    // One extra rAF to ensure the WebGL commands are flushed to the canvas.
    requestAnimationFrame(() => {
      renderer.render(scene, camera);
      canvas.value!.dataset.loaded = "true";
    });
  };
});
</script>

<template>
  <canvas ref="canvas" style="width: 200px; height: 200px; display: block" />
</template>
