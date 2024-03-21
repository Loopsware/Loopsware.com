import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

declare global {
  interface Window {
    myScene: THREE.Scene;
    myCamera: THREE.PerspectiveCamera;
  }
}

function init3D() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 0); // the second parameter is the opacity, set it to 0 for full transparency
  renderer.setSize(window.innerWidth / 1.333, window.innerHeight / 1.333);
  renderer.setPixelRatio(window.devicePixelRatio);

  if (!window.myScene) {
    // Create a scene
    const scene = new THREE.Scene();
    window.myScene = scene;
    // Existing point light
    const light = new THREE.PointLight(0xffffff, 80, 100);
    light.position.set(0, 0, 7);
    scene.add(light);

    // New point light for back illumination
    const backLight = new THREE.PointLight(0xffffff, 80, 100);
    backLight.position.set(0, 0, -5); // Position it behind the model
    scene.add(backLight);

    // Create a camera
    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.x = 0.5;
    camera.position.y = 1;
    camera.position.z = camera.position.z =
      window.innerWidth < 768 ? 5.65 : 5.825;

    window.myCamera = camera;
    scene.add(camera);

    document.body.appendChild(renderer.domElement);

    let model: any;
    // Load a .glb file
    const loader = new GLTFLoader();

    loader.load(
      "/public/phonehand.glb",
      function (gltf) {
        model = gltf.scene;
        scene.add(model);

        const scaleFactorX =
          window.innerWidth < 768
            ? 0.45
            : window.innerWidth > 768 && window.innerWidth < 1024
            ? 0.65
            : 1;
        model.scale.set(scaleFactorX, 1, scaleFactorX);
        model.position.x = -0.25;
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // Add a fluorescent blue light from the left
    const leftBlueLight = new THREE.DirectionalLight(0x0000ff, 2);
    leftBlueLight.position.set(-1, 0, 0);
    scene.add(leftBlueLight);

    // Add a fluorescent green light from the right
    const rightBlueLight = new THREE.DirectionalLight(0x0000ff, 2);
    rightBlueLight.position.set(1, 0, 0);
    scene.add(rightBlueLight);

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 2.5; // Limit the camera to 45 degrees above the horizon
    controls.maxPolarAngle = Math.PI / 2; // Limit the camera to 90 degrees above the horizon
    controls.minAzimuthAngle = -Math.PI / 6; // Limit the camera to 45 degrees to the left
    controls.maxAzimuthAngle = Math.PI / 5; // Limit the camera to 45 degrees to the right

    if (model) {
      controls.target.set(model.position.x, model.position.y, model.position.z);
    }

    let time = 0;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      // Check if the model is loaded
      if (model) {
        // Rotate the model back and forth between -0.15 and 0.15
        model.rotation.y = Math.sin(time) * 0.15;
        time += 0.005; // Increase time
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Get the window's width and height
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Adjust the height if on mobile
    if (width < 768) {
      height *= 0.45; // Reduce the height by 45%
    } else if (width >= 768 && width < 1024) {
      height *= 0.55; // Reduce the height by 80%
      width *= 0.65; // Reduce the width by 50%
    } else if (width >= 1024) {
      height *= 0.725; // Reduce the height by 80%
      width *= 0.75; // Reduce the width by 50%
    }

    // Update the renderer's size
    renderer.setSize(width, height);

    // Update the camera's aspect ratio when the window is resized
    window.addEventListener("resize", function () {
      const scaleFactorX =
        window.innerWidth < 768
          ? 0.45
          : window.innerWidth > 768 && window.innerWidth < 1024
          ? 0.65
          : 1;
      model.scale.set(scaleFactorX, 1, scaleFactorX);
      model.position.x = -0.25;

      //* Width & Height resizing
      width = window.innerWidth;
      height = window.innerHeight;

      if (width < 768) {
        height *= 0.45; // Reduce the height by 45%
      } else if (width >= 768 && width < 1024) {
        height *= 0.55; // Reduce the height by 80%
        width *= 0.65; // Reduce the width by 50%
      } else if (width >= 1024) {
        height *= 0.725; // Reduce the height by 80%
        width *= 0.75; // Reduce the width by 50%
      }

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });
  }

  // Select the container element
  const container: any = document.querySelector("#scene");
  container?.appendChild(renderer.domElement);

  if (!container.contains(renderer.domElement)) {
    // If not, append it to the document
    container?.appendChild(renderer.domElement);
  }

  // Render the scene
  renderer.render(window.myScene, window.myCamera);
}

export { init3D };
