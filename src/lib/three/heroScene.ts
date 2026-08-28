import {
  AmbientLight,
  CircleGeometry,
  Clock,
  Color,
  DirectionalLight,
  FogExp2,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  ACESFilmicToneMapping,
} from "three";
import { createMonsterCan } from "./monsterCan";

export type HeroSceneHandle = {
  dispose: () => void;
  setActive: (active: boolean) => void;
};

const VOID = 0x030503;
const PHOSPHOR = 0x9bf00b;
const XBOX_GREEN = 0x107c10;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createHeroScene(container: HTMLElement): HeroSceneHandle {
  const disposables: { dispose: () => void }[] = [];
  const reduced = prefersReducedMotion();

  const scene = new Scene();
  scene.background = new Color(VOID);
  scene.fog = new FogExp2(VOID, 0.045);

  const camera = new PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(1.35, 0.55, 5.4);

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
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  scene.add(new AmbientLight(0x1c241c, 0.55));

  const key = new DirectionalLight(0xf4ffe8, 2.4);
  key.position.set(3.2, 4.2, 4.5);
  scene.add(key);

  const rim = new DirectionalLight(PHOSPHOR, 1.6);
  rim.position.set(-4.5, 1.2, -2.4);
  scene.add(rim);

  const fill = new PointLight(0xdde8dd, 4.5, 18, 2);
  fill.position.set(-2.4, 0.8, 3.2);
  scene.add(fill);

  const bounce = new PointLight(XBOX_GREEN, 6, 14, 2);
  bounce.position.set(0.2, -1.6, 1.4);
  scene.add(bounce);

  const can = createMonsterCan(disposables);
  can.position.set(0.15, 0.08, 0);
  scene.add(can);

  const shadow = new Mesh(
    new CircleGeometry(1.2, 40),
    new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.2, -1.18, 0);
  shadow.scale.set(1, 0.62, 1);
  scene.add(shadow);
  disposables.push(shadow.geometry, shadow.material);

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

    can.rotation.y = time * 0.32 + pointer.x * 0.28;
    can.rotation.x = 0.16 + pointer.y * 0.08;
    can.position.y = 0.08 + Math.sin(time * 0.7) * 0.04;

    camera.position.x = 1.35 + pointer.x * 0.35;
    camera.position.y = 0.55 + pointer.y * 0.18;
    camera.lookAt(0.1, 0.15, 0);

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
    can.rotation.y = -0.55;
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
