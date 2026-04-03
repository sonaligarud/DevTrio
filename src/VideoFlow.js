import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AboutMe from "./AboutMe";
import { useNavigate } from "react-router-dom";

const STOP_FRAME = 10;
const UI_SHOW_FRAME = 150;
const END_FRAME = 227;

const framePath = (i) => {
  const n = String(i).padStart(5, "0");
  return `/assets/images/final-sequence/High/Final_${n}.jpg`;
};

export default function VideoFlow({ onComplete, skipIntro, introComplete, onOpenChatbot }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const posRef = useRef(skipIntro ? END_FRAME : 0);
  const targetPosRef = useRef(skipIntro ? END_FRAME : 0);
  const animIdRef = useRef(null);
  const cacheRef = useRef({});
  const lastDrawnRef = useRef(-1);
  const uiShownRef = useRef(skipIntro ? true : false);

  // keep introComplete accessible in wheel handler via ref
  const introCompleteRef = useRef(introComplete);
  useEffect(() => { introCompleteRef.current = introComplete; }, [introComplete]);

  // frame-derived UI states
  const [currentFrame, setCurrentFrame] = useState(skipIntro ? END_FRAME : 0);
  const [glitch, setGlitch] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  // stopped: user scrolled to frame 10 and stopped — show options
  const [stopped, setStopped] = useState(false);
  const stoppedRef = useRef(false);
  const scrollTimerRef = useRef(null);

  const setStoppedSync = (v) => { stoppedRef.current = v; setStopped(v); };

  // ── Load frames around index ──────────────────────────────────────────────
  const loadAround = useCallback((index, radius = 10) => {
    const cache = cacheRef.current;
    const from = Math.max(0, index - radius); // load backward too
    const to = Math.min(END_FRAME, index + radius);
    for (let i = from; i <= to; i++) {
      if (cache[i]) continue;
      const img = new Image();
      img.src = framePath(i);
      cache[i] = img;
    }
  }, []);

  // ── Draw frame — finds nearest loaded frame if target not ready ──────────
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cache = cacheRef.current;

    // try exact frame first, then search nearby — prefer backward frames when reversing
    let img = cache[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let d = 1; d <= 8; d++) {
        const prev = cache[index + d]; // higher index = already seen going forward
        if (prev && prev.complete && prev.naturalWidth > 0) { img = prev; break; }
        const next = cache[index - d];
        if (next && next.complete && next.naturalWidth > 0) { img = next; break; }
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    lastDrawnRef.current = index;
  }, []);

  // ── RAF loop ──────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    animIdRef.current = requestAnimationFrame(loop);
    const target = targetPosRef.current;
    const current = posRef.current;
    const diff = target - current;
    const next = Math.abs(diff) < 0.05 ? target : current + diff * 0.2;
    posRef.current = next;

    const idx = Math.max(0, Math.min(END_FRAME, Math.round(next)));

    if (idx !== lastDrawnRef.current) {
      drawFrame(idx);
      loadAround(idx);
      setCurrentFrame(idx);

      // forward: crossed UI_SHOW_FRAME → show welcome UI
      if (!uiShownRef.current && idx >= UI_SHOW_FRAME) {
        uiShownRef.current = true;
        setGlitch(true);
        setTimeout(() => setGlitch(false), 1200);
        onComplete?.();
        // preload all frames backward so reverse is smooth
        const cache = cacheRef.current;
        for (let i = END_FRAME; i >= 0; i--) {
          if (cache[i]) continue;
          const img = new Image();
          img.src = framePath(i);
          cache[i] = img;
        }
      }

      // backward: crossed below UI_SHOW_FRAME → (HomePage handles UI hide)
      if (uiShownRef.current && idx < UI_SHOW_FRAME) {
        uiShownRef.current = false;
      }
    }
  }, [drawFrame, loadAround, onComplete]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(Math.round(posRef.current));
    };
    resize();
    window.addEventListener("resize", resize);

    const start = skipIntro ? END_FRAME : 0;
    posRef.current = start;
    targetPosRef.current = start;
    loadAround(start, 20);

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [loop, drawFrame, loadAround, skipIntro]);

  // ── Wheel: scrub frames ───────────────────────────────────────────────────
  useEffect(() => {
    // expose reverse trigger for HomePage
    window.__videoFlowOnReverseScroll = () => {
      const cur = Math.round(targetPosRef.current);
      const cache = cacheRef.current;
      for (let i = cur; i >= 0; i--) {
        if (cache[i]) continue;
        const img = new Image();
        img.src = framePath(i);
        cache[i] = img;
      }
      uiShownRef.current = false;
    };

    const onWheel = (e) => {
      if (stoppedRef.current) setStoppedSync(false);

      const delta = e.deltaY > 0 ? 3 : -3;
      const newTarget = Math.max(0, Math.min(END_FRAME, targetPosRef.current + delta));
      targetPosRef.current = newTarget;

      const t = Math.round(newTarget);
      if (e.deltaY < 0) {
        const cache = cacheRef.current;
        for (let i = t; i >= Math.max(0, t - 20); i--) {
          if (cache[i]) continue;
          const img = new Image();
          img.src = framePath(i);
          cache[i] = img;
        }
      } else {
        loadAround(t, 15);
      }

      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const frame = Math.round(targetPosRef.current);
        if (frame >= STOP_FRAME - 1 && frame <= STOP_FRAME + 3 && !uiShownRef.current) {
          setStoppedSync(true);
        }
      }, 180);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(scrollTimerRef.current);
      delete window.__videoFlowOnReverseScroll;
    };
  }, [loadAround]);



  const showScrollDownHint = currentFrame < STOP_FRAME && !stopped;
  const showScrollUpHint = introComplete;

  return (
    <>
      <Box sx={{ position: "fixed", inset: 0, zIndex: introComplete ? 0 : 9999, background: "#000" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", position: "absolute", inset: 0, width: "100vw", height: "100vh" }}
        />

        {/* Glitch */}
        {glitch && (
          <Box sx={{ position: "absolute", inset: 0, zIndex: 10, animation: "glitchAnim 1.2s steps(1) forwards", pointerEvents: "none" }} />
        )}

        {/* Options panel — shown when stopped near frame 10 */}
        {stopped && (
          <Box sx={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{
              background: "rgba(5,12,8,0.88)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(0,255,150,0.2)", borderRadius: "16px",
              padding: "32px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              minWidth: { xs: "85vw", md: "420px" },
              animation: "fadeInUp 0.4s ease forwards",
            }}>
              <Typography sx={{ color: "#aaa", fontSize: "13px", letterSpacing: "1px" }}>
                Select as per your preference ?
              </Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, width: "100%" }}>
                <OptionButton label="Talk with my AI Assistant" onClick={onOpenChatbot} />
                <OptionButton label="Scroll to Continue Story" highlight
                  onClick={() => {
                    setStoppedSync(false);
                    targetPosRef.current = END_FRAME;
                    loadAround(STOP_FRAME, 50);
                  }}
                />
                <OptionButton label="Jump on Web Mode" onClick={() => navigate('/portfolio')} />
              </Box>
            </Box>
          </Box>
        )}

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounceDown {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50%       { transform: translateY(5px); opacity: 1; }
          }
          @keyframes bounceUp {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50%       { transform: translateY(-5px); opacity: 1; }
          }
          @keyframes glitchAnim {
            0%   { background: rgba(0,255,150,0.15); clip-path: inset(10% 0 80% 0); }
            10%  { background: rgba(255,0,80,0.1);   clip-path: inset(60% 0 20% 0); }
            20%  { background: rgba(0,255,150,0.2);  clip-path: inset(30% 0 50% 0); }
            30%  { background: transparent; }
            40%  { background: rgba(0,255,150,0.1);  clip-path: inset(5% 0 90% 0); }
            50%  { background: rgba(255,0,80,0.08);  clip-path: inset(70% 0 10% 0); }
            60%  { background: transparent; }
            70%  { background: rgba(0,255,150,0.15); clip-path: inset(20% 0 60% 0); }
            80%  { background: transparent; }
            90%  { background: rgba(0,255,150,0.05); clip-path: inset(45% 0 40% 0); }
            100% { background: transparent; }
          }
        `}</style>
      </Box>

      {/* Scroll DOWN hint */}
      {showScrollDownHint && (
        <Box sx={{ position: "fixed", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 99998, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, pointerEvents: "none" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>scroll</Typography>
          <KeyboardArrowDownIcon sx={{ color: "rgba(0,255,150,0.7)", fontSize: 22, animation: "bounceDown 1.4s ease-in-out infinite" }} />
        </Box>
      )}

      {/* Scroll UP hint — on final UI screen */}
      {showScrollUpHint && (
        <Box sx={{ position: "fixed", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 99998, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, pointerEvents: "none" }}>
          <KeyboardArrowUpIcon sx={{ color: "rgba(0,255,150,0.7)", fontSize: 22, animation: "bounceUp 1.4s ease-in-out infinite" }} />
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>scroll</Typography>
        </Box>
      )}

      {/* About Me */}
      <Box sx={{ position: "fixed", top: 24, right: 40, zIndex: 99999 }}>
        <Button onClick={() => setAboutOpen(true)} sx={{
          border: "1px solid #00ff9c", color: "#00ff9c", borderRadius: "6px",
          padding: "5px 18px", textTransform: "none", fontSize: "13px",
          "&:hover": { background: "#00ff9c", color: "#000" },
        }}>
          About Me
        </Button>
      </Box>
      <AboutMe open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

function OptionButton({ label, onClick, highlight }) {
  return (
    <Button onClick={onClick} sx={{
      flex: 1, padding: "11px 16px", borderRadius: "10px",
      border: highlight ? "1px solid rgba(0,255,150,0.5)" : "1px solid rgba(255,255,255,0.15)",
      color: highlight ? "#00ff9c" : "#bbb",
      textTransform: "none", fontSize: "12px",
      background: highlight ? "rgba(0,255,150,0.06)" : "rgba(255,255,255,0.03)",
      backdropFilter: "blur(10px)", whiteSpace: "nowrap",
      transition: "all 0.3s ease",
      "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c", boxShadow: "0 0 14px rgba(0,255,150,0.3)" },
    }}>
      {label}
    </Button>
  );
}
