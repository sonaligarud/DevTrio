import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AboutMe from "./AboutMe";
import { useNavigate } from "react-router-dom";

const STOP_FRAME = 10;
const STOP_FRAME_END = 20;
const UI_SHOW_FRAME = 155;  // welcome UI fades in from frame 155
const END_FRAME = 200;       // last archive frame

const framePath = (i) => {
  const n = String(i).padStart(5, "0");
  return `/assets/images/archive/Final_${n}.jpg`;
};

export default function VideoFlow({ onComplete, onFrameChange, skipIntro,onOpenChatbot,introComplete }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const posRef = useRef(skipIntro ? END_FRAME : 0);
  const targetPosRef = useRef(skipIntro ? END_FRAME : 0);
  const animIdRef = useRef(null);
  const cacheRef = useRef({});
  const lastDrawnRef = useRef(-1);
  const uiShownRef = useRef(skipIntro ? true : false);

  // welcome UI opacity — driven by frame position
  const [welcomeOpacity, setWelcomeOpacity] = useState(skipIntro ? 1 : 0);

  // keep introComplete accessible in wheel handler via ref
  const reversingRef = useRef(false);

  // frame-derived UI states
  const [currentFrame, setCurrentFrame] = useState(skipIntro ? END_FRAME : 0);
  const [aboutOpen, setAboutOpen] = useState(false);
  // stopped: user scrolled to frame 10 and stopped — show options
  const [stopped, setStopped] = useState(false);
  const stoppedRef = useRef(false);
  const scrollTimerRef = useRef(null);

  const setStoppedSync = (v) => { stoppedRef.current = v; setStopped(v); };

  // ── Load frames around index ──────────────────────────────────────────────
  const loadAround = useCallback((index, radius = 10) => {
    const cache = cacheRef.current;
    const from = Math.max(0, index - radius);
    const to = Math.min(END_FRAME, index + radius);
    for (let i = from; i <= to; i++) {
      if (cache[i]) continue;
      const img = new Image();
      img.src = framePath(i);
      cache[i] = img;
    }
  }, []);

  // preload backward from index in small batches so browser isn't overwhelmed
  const preloadBackward = useCallback((from, count = 30) => {
    const cache = cacheRef.current;
    let loaded = 0;
    for (let i = from; i >= 0 && loaded < count; i--) {
      if (cache[i]) continue;
      const img = new Image();
      img.src = framePath(i);
      cache[i] = img;
      loaded++;
    }
  }, []);

  // direction ref: +1 forward, -1 backward
  const dirRef = useRef(1);

  // ── Draw frame ───────────────────────────────────────────────────────────
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cache = cacheRef.current;

    let img = cache[index];

    // if exact frame not ready, search in the direction we came FROM
    // (i.e. frames we already passed — guaranteed to be loaded)
    if (!img || !img.complete || img.naturalWidth === 0) {
      const fallbackDir = -dirRef.current; // opposite of travel = already seen
      for (let d = 1; d <= 30; d++) {
        const f = cache[index + fallbackDir * d];
        if (f && f.complete && f.naturalWidth > 0) { img = f; break; }
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

    // track direction of travel
    if (diff > 0.1) dirRef.current = 1;
    else if (diff < -0.1) dirRef.current = -1;

    // step toward target one frame at a time so every frame gets drawn
    let next;
    if (Math.abs(diff) < 0.5) {
      next = target;
    } else {
      next = current + Math.sign(diff) * Math.min(Math.abs(diff), 1);
    }
    posRef.current = next;

    const idx = Math.max(0, Math.min(END_FRAME, Math.round(next)));

    if (idx !== lastDrawnRef.current) {
      drawFrame(idx);
      // preload ahead in direction of travel
      if (dirRef.current < 0) {
        preloadBackward(idx, 40);
      } else {
        loadAround(idx, 20);
      }
      setCurrentFrame(idx);
      onFrameChange?.(idx);

      // welcome UI: fade in 155→165, full until 200, fade out below 155
      if (idx >= UI_SHOW_FRAME) {
        setWelcomeOpacity(Math.min(1, (idx - UI_SHOW_FRAME) / 10));
      } else {
        setWelcomeOpacity(0);
      }

      // forward: crossed UI_SHOW_FRAME → notify parent
      if (!uiShownRef.current && idx >= UI_SHOW_FRAME) {
        uiShownRef.current = true;
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

      // backward: crossed below UI_SHOW_FRAME → reset so it can re-trigger
      if (uiShownRef.current && idx < UI_SHOW_FRAME) {
        uiShownRef.current = false;
      }

      // clear reversing only when we've fully scrubbed back to start
      if (reversingRef.current && idx <= 1) {
        reversingRef.current = false;
      }    }
  }, [drawFrame, loadAround, preloadBackward, onComplete, onFrameChange]);

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
    const onWheel = (e) => {
      if (stoppedRef.current) {
        const frame = Math.round(targetPosRef.current);
        // only dismiss if scrolling out of the stop zone
        if (frame < STOP_FRAME || frame > STOP_FRAME_END) {
          setStoppedSync(false);
        }
      }

      // if welcome UI is fully shown and user scrolls up — scrub backward
      if (e.deltaY < 0 && welcomeOpacity >= 1) {
        uiShownRef.current = false;
        reversingRef.current = true;
        preloadBackward(Math.round(targetPosRef.current), 40);
      }

      const delta = e.deltaY > 0 ? 1 : -1;
      const newTarget = Math.max(0, Math.min(END_FRAME, targetPosRef.current + delta));
      targetPosRef.current = newTarget;

      const t = Math.round(newTarget);
      if (e.deltaY < 0) {
        preloadBackward(t, 30);
      } else {
        loadAround(t, 15);
      }

      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const frame = Math.round(targetPosRef.current);
        if (frame >= STOP_FRAME && frame <= STOP_FRAME_END && !uiShownRef.current) {
          setStoppedSync(true);
        }
      }, 180);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(scrollTimerRef.current);
    };
  }, [loadAround, preloadBackward, welcomeOpacity]);



  const showScrollDownHint = currentFrame < STOP_FRAME && !stopped;
  const showScrollUpHint = welcomeOpacity >= 1;

  return (
    <>
      <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", position: "absolute", inset: 0, width: "100vw", height: "100vh" }}
        />



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

        {/* Welcome UI — fades in with frames 155→200 */}
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 5,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: welcomeOpacity,
          visibility: welcomeOpacity > 0 ? "visible" : "hidden",
          pointerEvents: welcomeOpacity > 0.5 ? "auto" : "none",
          transition: "none",
        }}>
          {/* Desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ position: "relative", width: "700px", display: "flex", alignItems: "center" }}>
              <Box sx={{
                flex: 1, height: "260px",
                backgroundImage: "url('/assets/images/vector_2026-03-26/vector@3x.png')",
                backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "16px", px: "40px",
              }}>
                <Typography sx={{ color: "#cfcfcf", fontSize: "18px", fontWeight: 400, mb: 1.5, letterSpacing: "0.5px" }}>
                  Welcome to the Portfolio
                </Typography>
                <Button onClick={onOpenChatbot} sx={{
                  width: "70%", padding: "11px 36px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)", color: "#bbb",
                  textTransform: "none", fontSize: "13px",
                  background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", whiteSpace: "nowrap",
                  "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" },
                }}>Talk with my AI Assistant</Button>
                <Button onClick={() => navigate('/portfolio')} sx={{
                  width: "70%", padding: "11px 36px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)", color: "#bbb",
                  textTransform: "none", fontSize: "13px",
                  background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", whiteSpace: "nowrap",
                  "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" },
                }}>Jump on Web Mode</Button>
              </Box>
              <Box sx={{ position: "absolute", right: "-80px", top: "10%", transform: "translateY(-50%)", width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", zIndex: 2 }}>
                <video src="/assets/orb/Welcome-state.mp4" autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            </Box>
            <Box sx={{ position: "absolute", bottom: 36, textAlign: "center" }}>
              <Typography sx={{ color: "#00ff9c", letterSpacing: "5px", fontSize: "20px", fontWeight: 500 }}>AKASH PARDESHI</Typography>
              <Typography sx={{ color: "#555", fontSize: "9px", letterSpacing: "7px", mt: 0.8 }}>UI DESIGNER &amp; UX RESEARCHER</Typography>
            </Box>
          </Box>

          {/* Mobile */}
          <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", px: 3 }}>
            <Box sx={{
              width: "100%", maxWidth: "360px",
              backgroundImage: "url('/assets/images/hud/Main_Landing_Page_Mobile.svg')",
              backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
              position: "relative", px: 3, pt: 3, pb: 4,
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              <Box sx={{ position: "absolute", top: "-40px", right: "-28px", width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", zIndex: 2 }}>
                <video src="/assets/orb/Welcome-state.mp4" autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ color: "#aaa", fontSize: "12px" }}>Welcome to the</Typography>
                <Typography sx={{ color: "#fff", fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>Portfolio</Typography>
              </Box>
              <Box sx={{ my: 1 }}>
                <Typography sx={{ color: "#00ff9c", letterSpacing: "3px", fontSize: "16px", fontWeight: 600 }}>AKASH PARDESHI</Typography>
                <Typography sx={{ color: "#555", fontSize: "8px", letterSpacing: "4px", mt: 0.5 }}>UI DESIGNER &amp; UX RESEARCHER</Typography>
              </Box>
              <Button onClick={onOpenChatbot} sx={{ width: "100%", padding: "12px 0", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", color: "#bbb", textTransform: "none", fontSize: "13px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" } }}>Talk with my AI Assistant</Button>
              <Button onClick={() => navigate('/portfolio')} sx={{ width: "100%", padding: "12px 0", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", color: "#bbb", textTransform: "none", fontSize: "13px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" } }}>Jump on Web Mode</Button>
            </Box>
          </Box>
        </Box>

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
        `}</style>
      </Box>

      {/* Scroll DOWN hint */}
      {showScrollDownHint && (
        <Box sx={{ position: "fixed", bottom: 36, left: 36, zIndex: 99998, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, pointerEvents: "none" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>scroll</Typography>
          <KeyboardArrowDownIcon sx={{ color: "rgba(0,255,150,0.7)", fontSize: 22, animation: "bounceDown 1.4s ease-in-out infinite" }} />
        </Box>
      )}

      {/* Scroll UP hint — on final UI screen */}
      {showScrollUpHint && (
        <Box sx={{ position: "fixed", bottom: 36, left: 36, zIndex: 99998, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, pointerEvents: "none" }}>
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
