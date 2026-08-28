import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let dispose = () => undefined;
    let observer: IntersectionObserver | null = null;

    import("../../lib/three/heroScene").then(({ createHeroScene }) => {
      if (cancelled || !el.isConnected) return;
      const scene = createHeroScene(el);
      if (cancelled) {
        scene.dispose();
        return;
      }
      dispose = scene.dispose;

      const hero = document.getElementById("hero");
      if (cancelled || !hero) return;
      observer = new IntersectionObserver(
        ([entry]) => scene.setActive(entry.isIntersecting),
        { threshold: 0.05 },
      );
      observer.observe(hero);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      dispose();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="hero-canvas"
      aria-hidden="true"
    />
  );
}
