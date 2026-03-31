/**
 * ScrollAnimation.js
 *
 * Scroll-driven frame-by-frame animation using Three.js.
 * - Frames 0–40 are pre-loaded PNGs.
 * - Frame index is mapped directly to scroll progress.
 * - Scroll down → next frame. Scroll up → previous frame.
 * - Looks like a scrubable video.
 * - The component takes up enough height to allow full scroll range.
 * - A sticky canvas stays fullscreen while scrolling through the frames.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

const TOTAL_FRAMES = 41;
const SCROLL_PX_PER_FRAME = 60; // px of scroll needed per frame
const TOTAL_SCROLL_HEIGHT = TOTAL_FRAMES * SCROLL_PX_PER_FRAME + window.innerHeight;

const FRAMES = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
    const n = String(i).padStart(5, "0");
    return `/assets/images/3d-animation-images/Comp%201_${n}.png`;
});

export default function ScrollAnimation({ onComplete, children }) {
    const wrapperRef = useRef(null);
    const mountRef = useRef(null);
    const stateRef = useRef({
        renderer: null,
        scene: null,
        camera: null,
        mat: null,
        cache: {},
        currentFrameIndex: -1,
        allLoaded: false,
        totalLoaded: 0,
    });

    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;
        const s = stateRef.current;

        // ── Three.js setup ──
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
        scene.add(new THREE.Mesh(geo, mat));
        s.mat = mat;

        // ── Preload all frames ──
        const loader = new THREE.TextureLoader();

        FRAMES.forEach((url, index) => {
            loader.load(
                url,
                (tex) => {
                    tex.minFilter = THREE.LinearFilter;
                    tex.magFilter = THREE.LinearFilter;
                    tex.generateMipmaps = false;
                    s.cache[index] = tex;
                    s.totalLoaded += 1;

                    // show frame 0 immediately
                    if (index === 0) {
                        mat.map = tex;
                        mat.color.set(0xffffff);
                        mat.needsUpdate = true;
                        renderer.render(scene, camera);
                    }

                    if (s.totalLoaded === TOTAL_FRAMES) {
                        s.allLoaded = true;
                    }
                },
                undefined,
                () => { s.cache[index] = null; }
            );
        });

        // ── Scroll handler ──
        const handleScroll = () => {
            if (!wrapperRef.current) return;
            const wrapperTop = wrapperRef.current.getBoundingClientRect().top + window.scrollY;
            const scrolled = window.scrollY - wrapperTop;
            const progress = Math.max(0, Math.min(1, scrolled / (TOTAL_SCROLL_HEIGHT - window.innerHeight)));
            const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

            if (frameIndex === s.currentFrameIndex) return;
            s.currentFrameIndex = frameIndex;

            const tex = s.cache[frameIndex];
            if (tex) {
                mat.map = tex;
                mat.color.set(0xffffff);
                mat.needsUpdate = true;
                renderer.render(scene, camera);
            }

            // Signal completion when user has scrolled through all frames
            if (frameIndex >= TOTAL_FRAMES - 1 && onComplete) {
                onComplete();
            }
        };

        // ── Resize ──
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);

        // Initial render
        renderer.render(scene, camera);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
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
            ref={wrapperRef}
            style={{
                height: `${TOTAL_SCROLL_HEIGHT}px`,
                position: "relative",
            }}
        >
            {/* Sticky container — pins to viewport while parent scrolls */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                }}
            >
                {/* Three.js canvas target */}
                <div
                    ref={mountRef}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
                {/* UI overlay on top of canvas */}
                {children}
            </div>
        </div>
    );
}
