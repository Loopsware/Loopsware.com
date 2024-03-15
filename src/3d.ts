import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Create a scene
const scene = new THREE.Scene();
// Existing point light
const light = new THREE.PointLight(0xffffff, 70, 100);
light.position.set(0, 0, 5);
scene.add(light);

// New point light for back illumination
const backLight = new THREE.PointLight(0xffffff, 70, 100);
backLight.position.set(0, 0, -5); // Position it behind the model
scene.add(backLight);

// Create a camera
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Create a renderer
// Create a renderer with alpha
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000, 0); // the second parameter is the opacity, set it to 0 for full transparency
renderer.setSize(window.innerWidth / 1.333, window.innerHeight / 1.333);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

let model: any;
// Load a .glb file
const loader = new GLTFLoader();
loader.load(
  "/public/phonehand.glb",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.minPolarAngle = Math.PI / 4; // Limit the camera to 45 degrees above the horizon
controls.maxPolarAngle = Math.PI / 2; // Limit the camera to 90 degrees above the horizon

// Set the target to the model's position
if (model) {
  controls.target.set(model.position.x, model.position.y, model.position.z);
}

let time = 0; // Initialize a time variable

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Check if the model is loaded
  if (model) {
    // Rotate the model back and forth between -0.4 and 0.4
    model.rotation.y = Math.sin(time) * 0.4;
    time += 0.005; // Increase time
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Select the container element
const container = document.querySelector("#scene");

// Append the renderer to the container instead of the body
container?.appendChild(renderer.domElement);
