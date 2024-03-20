import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
// Existing point light
const light = new THREE.PointLight(0xffffff, 50, 100);
light.position.set(0, 0, 5);
scene.add(light);

// Add a directional light from the top
const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(0, 1, 0);
scene.add(topLight);

// Add a point light at the front of the scene with a yellow color
const frontLight = new THREE.DirectionalLight(0x9400d3, 1);
frontLight.position.set(0, 0, 1);
scene.add(frontLight);

// Create a renderer with anti-aliasing
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000, 0);
if (window.innerWidth < 768) {
  renderer.setSize(window.innerWidth / 1.15, window.innerHeight / 1.6);
} else {
  renderer.setSize(window.innerWidth / 2.5, window.innerHeight / 1.9);
}
renderer.setPixelRatio(window.devicePixelRatio);

// Create a function to update the renderer and camera
function onWindowResize() {
  // Update the renderer's size
  if (window.innerWidth < 768) {
    renderer.setSize(window.innerWidth / 1.15, window.innerHeight / 1.6);
  } else {
    renderer.setSize(window.innerWidth / 2.5, window.innerHeight / 2);
  }

  // Update the camera's aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Add the event listener
window.addEventListener("resize", onWindowResize, false);

const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;
camera.position.x = 1;
camera.position.y = 1.5;

// Make the camera look at the center of the scene
camera.lookAt(new THREE.Vector3(0, 0, 0));

let model: any;

const loader = new GLTFLoader();
loader.load(
  "/public/old_computer.glb",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Change the color of the left light to a fluorescent orange color
const leftLight = new THREE.DirectionalLight(0xffa500, 3);
leftLight.position.set(-1, 0, 0);
scene.add(leftLight);

// Change the color of the right light to a fluorescent purple color
const rightLight = new THREE.DirectionalLight(0x9400d3, 2);
rightLight.position.set(1, 0, 0);
scene.add(rightLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.minPolarAngle = Math.PI / 4; // Limit the camera to 45 degrees above the horizon
controls.maxPolarAngle = Math.PI / 2; // Limit the camera to 90 degrees above the horizon
controls.minAzimuthAngle = -Math.PI / 4; // Limit the camera to 45 degrees to the left
controls.maxAzimuthAngle = Math.PI / 4; // Limit the camera to 45 degrees to the right

// Set the target to the model's position
if (model) {
  controls.target.set(model.position.x, model.position.y, model.position.z);
}

let time = 0;

function animate() {
  requestAnimationFrame(animate);

  // Check if the model is loaded
  if (model) {
    // Rotate the model back and forth between -0.25 and 0.25
    model.rotation.x = Math.sin(time) * 0.15;

    const scaleFactor =
      window.innerWidth < 768
        ? 0.85
        : window.innerWidth >= 768 && window.innerWidth < 1024
        ? 1
        : 1.4; // Increase the scale on mobile devices
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    time += 0.005; // Increase time
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

const container = document.querySelector("#scene");
container?.appendChild(renderer.domElement);
