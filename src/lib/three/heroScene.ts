import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Clock,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  FogExp2,
  GridHelper,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  PointLight,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
  ACESFilmicToneMapping,
} from "three";

export type HeroSceneHandle = {
  dispose: () => void;
  setActive: (active: boolean) => void;
};

const VOID = 0x030503;
const XBOX_GREEN = 0x107c10;
const PHOSPHOR = 0x9bf00b;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function track<T extends { dispose: () => void }>(bin: { dispose: () => void }[], resource: T): T {
  bin.push(resource);
  return resource;
}

export function createHeroScene(container: HTMLElement): HeroSceneHandle {
  const disposables: { dispose: () => void }[] = [];
  const reduced = prefersReducedMotion();

  const scene = new Scene();
  scene.background = new Color(VOID);
  scene.fog = new FogExp2(VOID, 0.085);

  const camera = new PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 1.15, 7.2);

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    return { dispose: () => undefined, setActive: () => undefined };
  }

  renderer.setClearColor(VOID, 1);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  scene.add(new AmbientLight(0x142014, 0.55));

  const key = new PointLight(PHOSPHOR, 14, 28, 2);
  key.position.set(0.6, 2.4, 3.2);
  scene.add(key);

  const rim = new PointLight(XBOX_GREEN, 8, 24, 2);
  rim.position.set(-3.2, -0.4, -1.4);
  scene.add(rim);

  const fill = new PointLight(0xdde8dd, 2.2, 20, 2);
  fill.position.set(4, 3.5, 2);
  scene.add(fill);

  const ringMat = track(
    disposables,
    new MeshStandardMaterial({
      color: XBOX_GREEN,
      emissive: PHOSPHOR,
      emissiveIntensity: 0.42,
      metalness: 0.92,
      roughness: 0.22,
    }),
  );

  const glowMat = track(
    disposables,
    new MeshBasicMaterial({
      color: PHOSPHOR,
      transparent: true,
      opacity: 0.09,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    }),
  );

  const innerMat = track(
    disposables,
    new MeshStandardMaterial({
      color: 0x0c1a0c,
      emissive: XBOX_GREEN,
      emissiveIntensity: 0.18,
      metalness: 0.85,
      roughness: 0.35,
    }),
  );

  const torusOuter = track(disposables, new TorusGeometry(2.35, 0.016, 12, 160));
  const torusInner = track(disposables, new TorusGeometry(1.55, 0.01, 10, 128));
  const torusGlow = track(disposables, new TorusGeometry(2.35, 0.07, 10, 96));
  const torusTilt = track(disposables, new TorusGeometry(2.05, 0.008, 8, 140));

  const rig = new Group();
  const outer = new Mesh(torusOuter, ringMat);
  const inner = new Mesh(torusInner, innerMat);
  const glow = new Mesh(torusGlow, glowMat);
  const tilted = new Mesh(torusTilt, ringMat);

  outer.rotation.x = Math.PI / 2.15;
  inner.rotation.x = Math.PI / 2.15;
  glow.rotation.x = Math.PI / 2.15;
  tilted.rotation.x = Math.PI / 2.6;
  tilted.rotation.y = Math.PI / 5;

  rig.add(outer, inner, glow, tilted);
  rig.position.y = 0.35;
  scene.add(rig);

  const grid = new GridHelper(48, 48, XBOX_GREEN, 0x0c1f0c);
  const gridMaterial = Array.isArray(grid.material) ? grid.material[0] : grid.material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.28;
  grid.position.y = -1.85;
  scene.add(grid);
  disposables.push({
    dispose: () => {
      grid.geometry.dispose();
      const materials = Array.isArray(grid.material) ? grid.material : [grid.material];
      materials.forEach((material) => material.dispose());
    },
  });

  const count = 220;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = Math.random() * 8 - 1.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  const pointsGeo = track(disposables, new BufferGeometry());
  pointsGeo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  const pointsMat = track(
    disposables,
    new PointsMaterial({
      color: PHOSPHOR,
      size: 0.028,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  const points = new Points(pointsGeo, pointsMat);
  scene.add(points);

  const clock = new Clock();
  const pointer = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  let raf = 0;
  let disposed = false;
  let pageVisible = true;
  let heroVisible = true;

  const setSize = () => {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
  };

  const renderFrame = (time: number) => {
    const delta = Math.min(clock.getDelta(), 0.05);
    pointer.x = MathUtils.damp(pointer.x, target.x, 4, delta);
    pointer.y = MathUtils.damp(pointer.y, target.y, 4, delta);

    rig.rotation.z = time * 0.08;
    tilted.rotation.z = -time * 0.05;
    points.rotation.y = time * 0.02;

    camera.position.x = pointer.x * 0.55;
    camera.position.y = 1.15 + pointer.y * 0.28;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  };

  const isRunning = () => pageVisible && heroVisible && !reduced && !disposed;

  const tick = () => {
    if (!isRunning()) return;
    raf = requestAnimationFrame(tick);
    renderFrame(clock.elapsedTime);
  };

  const startLoop = () => {
    if (!isRunning()) return;
    cancelAnimationFrame(raf);
    clock.getDelta();
    tick();
  };

  const onPointer = (event: PointerEvent) => {
    target.x = (event.clientX / window.innerWidth) * 2 - 1;
    target.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  const onVisibility = () => {
    pageVisible = document.visibilityState === "visible";
    if (pageVisible) startLoop();
    else cancelAnimationFrame(raf);
  };

  const resizeObserver = new ResizeObserver(setSize);
  resizeObserver.observe(container);
  setSize();

  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  if (reduced) {
    renderFrame(0);
  } else {
    clock.start();
    tick();
  }

  return {
    setActive: (active: boolean) => {
      heroVisible = active;
      if (heroVisible) startLoop();
      else cancelAnimationFrame(raf);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      disposables.forEach((resource) => resource.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
