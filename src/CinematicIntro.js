import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const FRAMES = Array.from({ length: 41 }, (_, i) => {
  const n = String(i).padStart(5, "0");
  return `/assets/images/3d-animation-images/Comp%201_${n}.png`;
});

const FRAME_DURATION = 200; // ms per frame — adjust for speed

export default function CinematicIntro({ onComplete }) {
  const mountRef = useRef(null);
  const r = useRef({
    renderer: null,
    scene: null,
    camera: null,
    mat: null,
    cache: {},
    frameIndex: 0,
    lastTime: 0,
    animId: null,
    finished: false,
    currentTex: null,
  });

  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const s = r.current;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    el.appendChild(renderer.domElement);
    s.renderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    s.scene = scene;
    s.camera = camera;

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: false });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    s.mat = mat;

    const loader = new THREE.TextureLoader();

    const loadFrame = (index) => {
      if (index < 0 || index >= FRAMES.length || s.cache[index]) return;
      s.cache[index] = "loading";
      loader.load(
        FRAMES[index],
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          s.cache[index] = tex;
        },
        undefined,
        () => { s.cache[index] = "error"; }
      );
    };

    loadFrame(0);
    loadFrame(1);

    const onResize = () => renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);

    const tick = (time) => {
      s.animId = requestAnimationFrame(tick);

      if (s.finished) {
        renderer.render(scene, camera);
        return;
      }

      if (time - s.lastTime < FRAME_DURATION) {
        renderer.render(scene, camera);
        return;
      }
      s.lastTime = time;

      const idx = s.frameIndex;
      const tex = s.cache[idx];

      if (tex && tex !== "loading" && tex !== "error") {
        if (s.currentTex !== tex) {
          s.currentTex = tex;
          mat.map = tex;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        }

        const next = idx + 1;

        if (next >= FRAMES.length) {
          s.finished = true;
          setDone(true);
          onComplete?.();
        } else {
          s.frameIndex = next;
          loadFrame(next + 1);

          const old = idx - 2;
          if (old >= 0 && s.cache[old] instanceof THREE.Texture) {
            s.cache[old].dispose();
            delete s.cache[old];
          }
        }
      }

      renderer.render(scene, camera);
    };

    s.animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(s.animId);
      window.removeEventListener("resize", onResize);
      Object.values(s.cache).forEach((t) => {
        if (t instanceof THREE.Texture) t.dispose();
      });
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: done ? 0 : 9999,
        width: "100vw",
        height: "100vh",
        background: "#000",
        pointerEvents: "none",
      }}
    />
  );
}
