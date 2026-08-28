import {
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
} from "three";

const MONSTER_GREEN = "#9bf00b";
const MONSTER_GREEN_DEEP = "#5a8a00";
const MONSTER_GREEN_GLOW = "#c8ff3d";
const CAN_BLACK = "#070807";

export type Disposable = { dispose: () => void };

function track<T extends Disposable>(bin: Disposable[], resource: T): T {
  bin.push(resource);
  return resource;
}

function drawTalon(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  ctx.scale(scale, scale);

  ctx.shadowColor = MONSTER_GREEN;
  ctx.shadowBlur = 28;

  ctx.beginPath();
  ctx.moveTo(0.12, -0.02);
  ctx.bezierCurveTo(0.38, 0.08, 0.52, 0.55, 0.36, 1.08);
  ctx.bezierCurveTo(0.3, 1.22, 0.16, 1.18, 0.14, 1.02);
  ctx.bezierCurveTo(0.08, 0.52, -0.12, 0.12, 0.12, -0.02);
  ctx.fillStyle = MONSTER_GREEN;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.moveTo(0.16, 0.04);
  ctx.bezierCurveTo(0.3, 0.14, 0.38, 0.5, 0.28, 0.92);
  ctx.bezierCurveTo(0.26, 0.98, 0.22, 0.9, 0.2, 0.72);
  ctx.bezierCurveTo(0.16, 0.36, 0.06, 0.12, 0.16, 0.04);
  ctx.fillStyle = MONSTER_GREEN_GLOW;
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();
}

function paintLabel(ctx: CanvasRenderingContext2D, width: number, height: number, glowOnly: boolean) {
  ctx.clearRect(0, 0, width, height);

  if (!glowOnly) {
    ctx.fillStyle = CAN_BLACK;
    ctx.fillRect(0, 0, width, height);

    const grain = ctx.createLinearGradient(0, 0, 0, height);
    grain.addColorStop(0, "rgba(255,255,255,0.03)");
    grain.addColorStop(0.5, "rgba(0,0,0,0)");
    grain.addColorStop(1, "rgba(255,255,255,0.025)");
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = MONSTER_GREEN;
    ctx.fillRect(0, height * 0.045, width, 6);
    ctx.fillRect(0, height * 0.94, width, 6);

    ctx.fillStyle = MONSTER_GREEN_DEEP;
    ctx.fillRect(0, height * 0.045 + 8, width, 2);
    ctx.fillRect(0, height * 0.94 - 4, width, 2);

    ctx.save();
    ctx.translate(width * 0.78, height * 0.28);
    ctx.fillStyle = "#161616";
    for (let i = 0; i < 18; i++) {
      const bar = i % 4 === 0 ? 7 : i % 3 === 0 ? 3 : 4;
      ctx.fillRect(i * 7, 0, bar, 70);
    }
    ctx.fillStyle = "#8d8d8d";
    ctx.font = "500 22px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("16 FL OZ  (473 mL)", 0, 108);
    ctx.fillText("ENERGY DRINK", 0, 138);
    ctx.restore();
  }

  const originX = width * 0.26;
  const originY = height * 0.14;
  const scale = height * 0.36;
  drawTalon(ctx, originX, originY, scale);
  drawTalon(ctx, originX + scale * 0.42, originY - scale * 0.04, scale * 1.04);
  drawTalon(ctx, originX + scale * 0.86, originY + scale * 0.02, scale * 0.96);

  if (!glowOnly) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = MONSTER_GREEN;
    ctx.shadowColor = MONSTER_GREEN;
    ctx.shadowBlur = 18;
    ctx.font = "800 92px Impact, Haettenschweiler, ui-sans-serif, sans-serif";
    ctx.fillText("M O N S T E R", width * 0.42, height * 0.72);
    ctx.font = "700 48px Impact, Haettenschweiler, ui-sans-serif, sans-serif";
    ctx.fillText("E N E R G Y", width * 0.42, height * 0.8);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(155,240,11,0.55)";
    ctx.font = "600 18px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("UNLEASH THE BEAST", width * 0.318, height * 0.86);
    ctx.restore();
  }
}

function createLabelTextures(bin: Disposable[]) {
  const width = 2048;
  const height = 1024;

  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = width;
  mapCanvas.height = height;
  const mapCtx = mapCanvas.getContext("2d");
  if (!mapCtx) throw new Error("Canvas 2D unavailable");
  paintLabel(mapCtx, width, height, false);

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = width;
  glowCanvas.height = height;
  const glowCtx = glowCanvas.getContext("2d");
  if (!glowCtx) throw new Error("Canvas 2D unavailable");
  glowCtx.fillStyle = "#000";
  glowCtx.fillRect(0, 0, width, height);
  paintLabel(glowCtx, width, height, true);

  const map = track(bin, new CanvasTexture(mapCanvas));
  map.colorSpace = SRGBColorSpace;
  map.wrapS = RepeatWrapping;
  map.offset.x = 0.38;
  map.anisotropy = 8;

  const emissiveMap = track(bin, new CanvasTexture(glowCanvas));
  emissiveMap.colorSpace = SRGBColorSpace;
  emissiveMap.wrapS = RepeatWrapping;
  emissiveMap.offset.x = 0.38;
  emissiveMap.anisotropy = 8;

  return { map, emissiveMap };
}

export function createMonsterCan(bin: Disposable[]) {
  const group = new Group();
  const { map, emissiveMap } = createLabelTextures(bin);

  const bodyGeo = track(bin, new CylinderGeometry(0.82, 0.84, 2.18, 64, 1, true));
  const bodyMat = track(
    bin,
    new MeshPhysicalMaterial({
      map,
      emissiveMap,
      emissive: 0x9bf00b,
      emissiveIntensity: 0.4,
      roughness: 0.28,
      metalness: 0.32,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
    }),
  );
  const body = new Mesh(bodyGeo, bodyMat);
  group.add(body);

  const metal = track(
    bin,
    new MeshStandardMaterial({
      color: 0xc7ccc4,
      metalness: 1,
      roughness: 0.22,
    }),
  );
  const darkMetal = track(
    bin,
    new MeshStandardMaterial({
      color: 0x121412,
      metalness: 0.88,
      roughness: 0.38,
    }),
  );
  const blackPaint = track(
    bin,
    new MeshStandardMaterial({
      color: 0x080908,
      metalness: 0.55,
      roughness: 0.32,
    }),
  );

  const shoulderPts = [
    new Vector2(0.82, 0),
    new Vector2(0.8, 0.05),
    new Vector2(0.68, 0.14),
    new Vector2(0.57, 0.2),
    new Vector2(0.55, 0.26),
  ];
  const shoulder = new Mesh(track(bin, new LatheGeometry(shoulderPts, 48)), blackPaint);
  shoulder.position.y = 1.09;
  group.add(shoulder);

  const lid = new Mesh(track(bin, new CircleGeometry(0.55, 48)), metal);
  lid.rotation.x = -Math.PI / 2;
  lid.position.y = 1.35;
  group.add(lid);

  const well = new Mesh(track(bin, new CircleGeometry(0.38, 40)), darkMetal);
  well.rotation.x = -Math.PI / 2;
  well.position.y = 1.352;
  group.add(well);

  const rim = new Mesh(track(bin, new TorusGeometry(0.55, 0.02, 10, 48)), metal);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.35;
  group.add(rim);

  const tabRing = new Mesh(track(bin, new TorusGeometry(0.09, 0.016, 8, 20)), metal);
  tabRing.position.set(0.02, 1.38, 0.12);
  tabRing.rotation.x = Math.PI / 2.35;
  group.add(tabRing);

  const tab = new Mesh(track(bin, new CylinderGeometry(0.032, 0.048, 0.2, 8)), metal);
  tab.position.set(0.02, 1.372, 0.01);
  tab.rotation.z = Math.PI / 2;
  tab.rotation.y = 0.35;
  group.add(tab);

  const bottomRim = new Mesh(track(bin, new TorusGeometry(0.82, 0.03, 8, 48)), darkMetal);
  bottomRim.rotation.x = Math.PI / 2;
  bottomRim.position.y = -1.09;
  group.add(bottomRim);

  const bottom = new Mesh(track(bin, new CircleGeometry(0.82, 40)), darkMetal);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -1.09;
  group.add(bottom);

  group.rotation.x = 0.16;
  group.rotation.z = -0.1;
  return group;
}
