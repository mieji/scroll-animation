import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// canvas
const canvas = document.querySelector("#webgl");

// 変数
let stlMesh = null;
let text;
// Canvas Size
const sizes = {
  width: innerWidth,
  height: innerHeight,
};

// Scene
const scene = new THREE.Scene();

// BackGround Image
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load("bg/bg.jpg");
scene.background = bgTexture;

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

// Enviroment Map
const urls = [
  "./envimage/right.png",
  "./envimage/left.png",
  "./envimage/up.png",
  "./envimage/down.png",
  "./envimage/front.png",
  "./envimage/back.png",
];
const cubeLoader = new THREE.CubeTextureLoader();

// Create cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(100);

// Add Light
const Light = new THREE.AmbientLight(0xffffff);
scene.add(Light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add MeshStandardMaterial
const objMaterial = new THREE.MeshStandardMaterial({
  envMap: cubeLoader.load(urls),
  metalness: 0.9,
  roughness: 0.1,
});
// Add Objects

//  Add Font
const fontLoader = new FontLoader();

fontLoader.load(
  "./node_modules/three/examples/fonts/helvetiker_bold.typeface.json",
  function (font) {
    const textGeometry = new TextGeometry("UVSOR", {
      font: font,
      size: 1,
      height: 2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 3,
    });
    textGeometry.center();
    text = new THREE.Mesh(textGeometry, objMaterial);
    text.position.set(0, 0.5, -15);
    scene.add(text);
  }
);
console.log(text);
// box
const boxGeometry = new THREE.BoxGeometry(5, 5, 5, 10);

const box = new THREE.Mesh(boxGeometry, objMaterial);
box.position.set(0, 0.5, -15);
box.rotation.set(1, 1, 0);
// torus
const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100);
const torus = new THREE.Mesh(torusGeometry, objMaterial);
torus.position.set(0, 1, 10);
// scene.add(box, torus);

// Gltf loader
//glbファイルの読み込み
// const loader = new GLTFLoader();

// loader.load(
//   "./gltf/DamagedHelmet.gltf",
//   function (gltf) {
//     gltf.scene.position.set(0, 0, 0);
//     gltf.scene.scale.set(2, 2, 2);
//     gltf.scene.rotation.y = 90;
//     scene.add(gltf.scene);
//   },
//   undefined,
//   function (e) {
//     console.error(e);
//   }
// );

// STL Loarder

const stlLoader = new STLLoader();
stlLoader.load("./uvsor.stl", function (geometry) {
  const mesh = new THREE.Mesh(geometry, objMaterial);
  mesh.rotation.set(-90, 0, 90);
  mesh.position.set(0, 0, 20);
  mesh.name = "stl";
  scene.add(mesh);
  stlMesh = mesh;
  // console.log(stlMesh);
});

console.log(stlMesh);
//Linear Interpolation
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}
function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start);
}
//  Scroll Animation

const animationScripts = [];
animationScripts.push({
  start: 0,
  end: 40,
  function() {
    camera.lookAt(text.position);
    camera.position.set(0, 1, 5);
    text.position.z = lerp(-15, 2, scalePercent(0, 40));
    torus.position.z = lerp(10, -20, scalePercent(0, 40));
    stlMesh.position.z = lerp(20, 0, scalePercent(0, 40));
  },
});

animationScripts.push({
  start: 40,
  end: 60,
  function() {
    camera.lookAt(box.position);
    camera.position.set(0, 1, 5);
    text.rotation.x = lerp(0, Math.PI * 2, scalePercent(40, 60));
  },
});

animationScripts.push({
  start: 60,
  end: 80,
  function() {
    camera.lookAt(text.position);
    camera.position.x = lerp(0, -15, scalePercent(60, 80));
    camera.position.y = lerp(1, 15, scalePercent(60, 80));
    camera.position.z = lerp(5, 10, scalePercent(60, 80));
  },
});

animationScripts.push({
  start: 80,
  end: 100,
  function() {
    camera.lookAt(text.position);
    text.rotation.x += 0.02;
    stlMesh.rotation.z += 0.001;
  },
});

// Play Animation
function playScrollAnimation() {
  animationScripts.forEach((animation) => {
    if (scrollPercent >= animation.start && scrollPercent <= animation.end)
      animation.function();
  });
}

// Get Scroll % in Browser
let scrollPercent = 0;

document.body.onscroll = () => {
  scrollPercent =
    (document.documentElement.scrollTop /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight)) *
    100;
  console.log(scrollPercent);
};

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

// Animation
const tick = () => {
  window.requestAnimationFrame(tick);
  playScrollAnimation();
  renderer.render(scene, camera);
  console.log(stlMesh.name);
  console.log(text);
};

tick();

// Resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});
