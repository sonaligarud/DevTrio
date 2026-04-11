import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Typography, InputBase, IconButton, CircularProgress } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import { AboutMeContent } from "./AboutMe";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";

const STOP_FRAME = 10;
const STOP_FRAME_END = 20;
const UI_SHOW_FRAME = 155;
const END_FRAME = 200;

const framePath = (i) => {
  const n = String(i).padStart(5, "0");
  return `/assets/images/archive/Final_${n}.jpg`;
};

const socials = [
  { label: "LinkedIn", icon: "/assets/icons/linkedIn.svg" },
  { label: "Behance", icon: "/assets/icons/Behance.svg" },
  { label: "Dribbble", icon: "/assets/icons/Dribble.svg" },
  { label: "Mobile", icon: "/assets/icons/Mobile.svg" },
  { label: "Mail", icon: "/assets/icons/Mail.svg" },
];

/* ── Inline Chatbot panel ── */
function ChatbotInline() {
  const { messages, isLoading, sendMessage, messagesEndRef } = useChat();
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) { sendMessage(inputValue); setInputValue(""); }
  };

  const { isListening, interimText, toggleListening, isProcessing } = useSpeech({
    onTranscript: (text) => setInputValue((p) => p ? p + " " + text : text),
    useBackend: true,
    onBackendTranscript: async (blob) => {
      try {
        const data = await transcribeAudio(blob);
        if (data.transcript) setInputValue((p) => p ? p + " " + data.transcript : data.transcript);
      } catch (e) { console.error(e); }
    },
  });

  return (
    <Box sx={{
      flex: 1, display: "flex", flexDirection: "column",
      background: "rgba(10,14,10,0.85)",
      borderRadius: "0 16px 16px 0",
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: "none",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Orb top-right */}
      <Box sx={{
        position: "absolute", top: -30, right: -30,
        width: 110, height: 110, borderRadius: "50%",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(0,255,150,0.3)",
        boxShadow: "0 0 20px rgba(0,255,150,0.2)",
        overflow: "hidden", zIndex: 10,
      }}>
        <video src="/assets/orb/Welcome-state.mp4" autoPlay loop muted playsInline
          style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen" }} />
      </Box>

      {/* Messages / greeting */}
      <Box sx={{
        flex: 1, overflowY: "auto", p: "24px 24px 0",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "2px" },
      }}>
        {messages.length === 0 ? (
          <Box sx={{ mt: 6 }}>
            <Typography sx={{ color: "#aaa", fontSize: "13px", lineHeight: 1.7 }}>
              Hi!<br />
              I'm <span style={{ color: "#00ff9c", fontWeight: 600 }}>Nova</span>, Akash's AI Assistant.<br />
              I can walk you through projects, thinking,<br />
              and decisions.<br />
              Where should we start?
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {messages.map((msg) => (
              <Box key={msg.id} sx={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "rgba(0,255,150,0.1)" : "rgba(255,255,255,0.05)",
                border: msg.role === "user" ? "1px solid rgba(0,255,150,0.25)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", px: 2, py: 1,
                maxWidth: "85%", color: "#fff", fontSize: "13px", lineHeight: 1.5,
              }}>{msg.content}</Box>
            ))}
            {isLoading && <CircularProgress size={18} sx={{ color: "#00ff9c", alignSelf: "flex-start" }} />}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <Box sx={{ display: "flex", gap: 1, px: 3, pb: 1.5, flexWrap: "wrap" }}>
          {["View Case Study", "How I Design", "Start Chat"].map((s) => (
            <Box key={s} onClick={() => sendMessage(s)} sx={{
              px: 2, py: 0.8, borderRadius: "20px",
              background: "#00ff9c", color: "#000",
              fontSize: "11px", fontWeight: 600, cursor: "pointer",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,255,150,0.4)" },
            }}>{s}</Box>
          ))}
        </Box>
      )}

      {/* Input */}
      <Box sx={{ p: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px", px: 2, py: 0.8,
        }}>
          <InputBase
            placeholder={isListening ? "Listening..." + (interimText ? ` ${interimText}` : "") : "Ask anything"}
            fullWidth value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading || isProcessing}
            sx={{ color: "#aaa", fontSize: "13px", "& input::placeholder": { color: isListening ? "#00ff9c" : "#555", opacity: 1 } }}
          />
          <IconButton onClick={toggleListening} size="small" sx={{ color: isListening ? "#00ff9c" : "#666", p: "4px" }}>
            <MicIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={handleSend} size="small" disabled={isLoading || isProcessing}
            sx={{
              background: "#00ff9c", color: "#000", borderRadius: "8px", p: "4px",
              "&:hover": { background: "#00e68a" }, "&.Mui-disabled": { background: "rgba(0,255,150,0.2)" }
            }}>
            {isLoading || isProcessing
              ? <CircularProgress size={16} sx={{ color: "#000" }} />
              : <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Welcome split screen ── */
function WelcomeScreen({ opacity }) {
  const containerRef = useRef(null);
  const [leftPct, setLeftPct] = useState(58); // % width for left panel
  const dragging = useRef(false);

  const onMouseDown = (e) => { dragging.current = true; e.preventDefault(); };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const pct = Math.min(75, Math.max(30, (x / rect.width) * 100));
      setLeftPct(pct);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <Box sx={{
      position: "absolute", inset: 0, zIndex: 5,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity, visibility: opacity > 0 ? "visible" : "hidden",
      pointerEvents: opacity > 0.5 ? "auto" : "none",
      px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 },
    }}>
      {/* Social icons — left edge */}
      <Box sx={{
        display: { xs: "none", md: "flex" }, flexDirection: "column",
        alignItems: "center", gap: 1.5, mr: 2,
      }}>
        {socials.map(({ label, icon }) => (
          <Box key={label} sx={{
            width: 36, height: 36, borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "border 0.2s, box-shadow 0.2s",
            "&:hover": { border: "1px solid rgba(0,255,150,0.5)", boxShadow: "0 0 8px rgba(0,255,150,0.2)" },
          }}>
            <Box component="img" src={icon} alt={label} sx={{ width: 18, height: 18, filter: "brightness(0) invert(0.6)" }} />
          </Box>
        ))}
      </Box>

      {/* Split container */}
      <Box ref={containerRef} sx={{
        flex: 1, display: "flex", height: { xs: "90vh", md: "75vh" },
        maxWidth: "1100px", position: "relative",
        borderRadius: "16px",
        overflow: "visible",
      }}>
        {/* Left panel — AboutMe */}
        <Box sx={{
          width: `${leftPct}%`, flexShrink: 0,
          background: "rgba(8,11,8,0.92)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRight: "none",
          borderRadius: "16px 0 0 16px",
          overflowY: "auto", p: "28px 28px 24px",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(0,255,150,0.2)", borderRadius: "2px" },
        }}>
          <AboutMeContent onClose={() => { }} mobile={false} />
        </Box>

        {/* Draggable divider */}
        <Box
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          sx={{
            width: "18px", flexShrink: 0,
            background: "rgba(15,20,15,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "col-resize", zIndex: 2, position: "relative",
            "&:hover .drag-handle": { background: "rgba(0,255,150,0.6)" },
          }}
        >
          <Box className="drag-handle" sx={{
            width: 4, height: 40, borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            transition: "background 0.2s",
          }} />
        </Box>

        {/* Right panel — Chatbot */}
        <ChatbotInline />
      </Box>
    </Box>
  );
}

export default function VideoFlow({ onComplete, onFrameChange, skipIntro, onOpenChatbot, introComplete }) {
  const canvasRef = useRef(null);

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

      // welcome UI: fade in 155→165, visible 165→170, fade out 170→180
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
      }
    }
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



  const showScrollUpHint = welcomeOpacity >= 1;
  const showScrollEntry = currentFrame < STOP_FRAME && !stopped;

  // mute state for the ON/OFF button
  const [muted, setMuted] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
    setMuted((m) => !m);
  };

  return (
    <>
      <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", position: "absolute", inset: 0, width: "100vw", height: "100vh" }}
        />

        {/* Welcome split screen — fades in with animation */}
        <WelcomeScreen opacity={welcomeOpacity} />

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

      {/* Scroll entry card — shown on frame 0 before scrolling */}
      {showScrollEntry && (
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 99997,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 2,
            px: "40px", py: "22px",
            borderRadius: "14px",
            background: "rgba(40,50,45,0.55)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            minWidth: "280px",
          }}>
            {/* Mouse scroll icon */}
            <Box
              component="img"
              src="/assets/gif/scroll.gif"
              alt="scroll down"
              sx={{ width: "20px" }}
            />
            {/* Text */}
            <Box>
              <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", fontWeight: 400, lineHeight: 1.5 }}>
                Scroll to enter in the
              </Typography>
              <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 700, lineHeight: 1.3 }}>
                Design lab
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ON/OFF mute button — bottom right */}
      <Box sx={{
        position: "fixed", bottom: 28, right: 28, zIndex: 99998,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
      }}>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase" }}>
          ON/OFF
        </Typography>
        <Box
          onClick={() => handleMuteToggle()}
          sx={{
            width: 40, height: 40, borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(30,35,30,0.7)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "border 0.2s, box-shadow 0.2s",
            "&:hover": { border: "1px solid rgba(0,255,150,0.5)", boxShadow: "0 0 10px rgba(0,255,150,0.2)" },
          }}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </Box>
      </Box>

      {/* Scroll gif — bottom left, frame 1–5 (gif only) */}

      {/* Scroll gif + text — bottom left, after frame 6 until welcome UI */}
      {currentFrame > 6 && welcomeOpacity === 0 && (
        <Box sx={{
          position: "fixed", bottom: 28, left: 28, zIndex: 99998,
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          pointerEvents: "none",
        }}>
           <Typography sx={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>
            scroll down
          </Typography>
          <Box
            component="img"
            src="/assets/gif/scroll.gif"
            alt="scroll"
            sx={{ width: 20, opacity: 0.85 }}
          />
         
        </Box>
      )}

      {/* Scroll UP hint — on final UI screen */}
      {showScrollUpHint && (
        <Box sx={{ position: "fixed", bottom: 36, left: 36, zIndex: 99998, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, pointerEvents: "none" }}>
          <KeyboardArrowUpIcon sx={{ color: "rgba(0,255,150,0.7)", fontSize: 22, animation: "bounceUp 1.4s ease-in-out infinite" }} />
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>scroll</Typography>
        </Box>
      )}

    </>
  );
}
