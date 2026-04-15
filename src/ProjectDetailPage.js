import { useState, useRef, useEffect } from "react";
import { Box, Tabs, Tab, IconButton, Typography, InputBase, CircularProgress, Button, Tooltip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";

const mainTabs = ["UI/UX", "Social Media", "Videos", "Print Media"];
const subTabs = ["Project -1", "Project - 2", "Project - 3", "Project - 4"];

const projectSlides = {
  0: [
    "/assets/images/projects/swift/1.jpg",
    "/assets/images/projects/swift/2.jpg",
    "/assets/images/projects/swift/3.jpg",
    "/assets/images/projects/swift/4.jpg",
    "/assets/images/projects/swift/5.jpg",
    "/assets/images/projects/swift/6.jpg",
    "/assets/images/projects/swift/7.jpg",
    "/assets/images/projects/swift/8.jpg",
    "/assets/images/projects/swift/9.jpg",
  ],
  1: ["/assets/images/projects/swift/1.jpg"],
  2: ["/assets/images/projects/swift/1.jpg"],
  3: ["/assets/images/projects/swift/1.jpg"],
};

// Per main-tab config: chatbot HUD bg + orb video
const tabConfig = [
  { hudBg: "/assets/images/hud/portfolio-chantbot.svg", orb: "/assets/orb/Idle State.mp4" },
  { hudBg: "/assets/images/hud/portfolio-chantbot.svg", orb: "/assets/orb/Listening State.mp4" },
  { hudBg: "/assets/images/hud/portfolio-chantbot.svg", orb: "/assets/orb/Searching State.mp4" },
  { hudBg: "/assets/images/hud/portfolio-chantbot.svg", orb: "/assets/orb/Speaking State.mp4" },
];

// ─── Chatbot Panel (same as PortfolioPage) ────────────────────────────────────
function ChatbotPanel() {
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Messages */}
      <Box sx={{
        flex: 1, overflowY: "auto", px: 2.5, pt: 3, pb: 1,
        "&::-webkit-scrollbar": { width: "3px" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(0,205,31,0.2)", borderRadius: "2px" },
      }}>
        {messages.length === 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: "#aaa", fontSize: "13px", lineHeight: 1.8 }}>
              Hi!<br />
              I'm <span style={{ color: "#00CD1F", fontWeight: 600 }}>Nova</span>, Akash's AI Assistant.<br />
              I can walk you through projects, thinking, and decisions.<br />
              Where should we start?
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {messages.map((msg) => (
              <Box key={msg.id} sx={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "rgba(0,205,31,0.1)" : "rgba(255,255,255,0.05)",
                border: msg.role === "user" ? "1px solid rgba(0,205,31,0.25)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", px: 2, py: 1,
                maxWidth: "85%", color: "#fff", fontSize: "13px", lineHeight: 1.5,
              }}>{msg.content}</Box>
            ))}
            {isLoading && <CircularProgress size={18} sx={{ color: "#00CD1F", alignSelf: "flex-start" }} />}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <Box sx={{ display: "flex", gap: 1, px: 2.5, pb: 1.5, flexWrap: "wrap" }}>
          {["View Case Study", "About Akash"].map((s) => (
            <Box key={s} onClick={() => sendMessage(s)} sx={{
              px: 2, py: 0.7, borderRadius: "20px",
              background: "rgba(0,205,31,0.12)",
              border: "1px solid rgba(0,205,31,0.35)",
              color: "#00CD1F", fontSize: "11px", fontWeight: 600, cursor: "pointer",
              "&:hover": { background: "rgba(0,205,31,0.2)" },
            }}>{s}</Box>
          ))}
        </Box>
      )}

      {/* Input bar */}
      <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px", px: 1.5, py: 0.7,
        }}>
          <InputBase
            placeholder={isListening ? "Listening..." + (interimText ? ` ${interimText}` : "") : "Ask anything"}
            fullWidth value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading || isProcessing}
            sx={{ color: "#ccc", fontSize: "13px", "& input::placeholder": { color: isListening ? "#00CD1F" : "#555", opacity: 1 } }}
          />
          <IconButton onClick={toggleListening} size="small" sx={{ color: isListening ? "#00CD1F" : "#555", p: "4px" }}>
            <MicIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton onClick={handleSend} size="small" disabled={isLoading || isProcessing}
            sx={{
              background: "#00CD1F", color: "#000", borderRadius: "7px", p: "4px",
              "&:hover": { background: "#00b81a" },
              "&.Mui-disabled": { background: "rgba(0,205,31,0.2)" },
            }}>
            {isLoading || isProcessing
              ? <CircularProgress size={15} sx={{ color: "#000" }} />
              : <ArrowUpwardIcon sx={{ fontSize: 15 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [leftPct, setLeftPct] = useState(75);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slides = projectSlides[subTab];
  const { hudBg, orb } = tabConfig[mainTab];

  const next = () => setSlideIndex((p) => (p + 1) % slides.length);
  const prev = () => setSlideIndex((p) => (p === 0 ? slides.length - 1 : p - 1));

  const lbNext = () => setLightboxIndex((p) => (p + 1) % slides.length);
  const lbPrev = () => setLightboxIndex((p) => (p === 0 ? slides.length - 1 : p - 1));

  const openLightbox = () => { setLightboxIndex(slideIndex); setLightboxOpen(true); };

  const containerRef = useRef(null);
  const dragging = useRef(false);

  const onMouseDown = (e) => { dragging.current = true; e.preventDefault(); };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const pct = Math.min(85, Math.max(40, (x / rect.width) * 100));
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
      minHeight: "100vh",
      background: "radial-gradient(circle at 20% 20%, #0b1f1a, #020605 70%)",
      p: { xs: 2, md: 4 },
      color: "#fff",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* MAIN TABS */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Tabs
          value={mainTab}
          onChange={(_, v) => { setMainTab(v); setSubTab(0); setSlideIndex(0); }}
          sx={{ "& .MuiTabs-indicator": { display: "none" }, "& .MuiTabs-flexContainer": { gap: 1 } }}
        >
          {mainTabs.map((tab, i) => (
            <Tab key={i} label={tab} sx={{
              textTransform: "none", px: 3, py: 1, borderRadius: "20px", minHeight: "unset",
              color: mainTab === i ? "#00ff9f" : "#888",
              border: mainTab === i ? "1px solid rgba(0,255,150,0.6)" : "1px solid rgba(255,255,255,0.1)",
              background: mainTab === i ? "rgba(0,255,150,0.08)" : "transparent",
            }} />
          ))}
        </Tabs>
      </Box>

      {/* CONTENT ROW */}
      <Box ref={containerRef} sx={{ flex: 1, display: "flex", gap: 0, position: "relative" }}>

        {/* LEFT PANEL */}
        <Box sx={{ width: `${leftPct}%`, flexShrink: 0, display: "flex", flexDirection: "column", pr: 1 }}>
          <Box sx={{
            flex: 1,
            backgroundImage: "url('/assets/images/hud/portfolio-page.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* SUB TABS ROW */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, pb: 1 }}>
              <img src="/assets/icons/right.svg" alt="back" style={{ cursor: "pointer" }} />
              {subTabs.map((tab, i) => (
                <Button key={i} onClick={() => { setSubTab(i); setSlideIndex(0); }} sx={{
                  textTransform: "none", px: 2.5, py: 0.8, borderRadius: "10px",
                  minWidth: "unset", fontSize: "0.85rem",
                  color: subTab === i ? "#00ff9f" : "#666",
                  border: subTab === i ? "1px solid rgba(0,255,150,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: subTab === i ? "rgba(0,255,150,0.1)" : "rgba(255,255,255,0.02)",
                }}>
                  {tab}
                </Button>
              ))}
            </Box>

            {/* SLIDER AREA */}
            <Box sx={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <IconButton onClick={prev} sx={{ position: "absolute", left: 8, zIndex: 2, p: 0, border: "none", background: "none" }}>
                <img src="/assets/icons/right.svg" alt="prev"/>
              </IconButton>

              <Box sx={{ flex: 1, display: "flex", alignItems: "center", px: "56px" }}>
                <Box sx={{ flex: "0 0 50%", maxWidth: "50%", position: "relative" }}>
                  <img
                    src={slides[slideIndex]}
                    alt={`slide ${slideIndex + 1}`}
                    style={{ width: "100%", display: "block", borderRadius: "12px" }}
                  />
                  {/* BOTTOM-RIGHT ACTION ICONS — on the image */}
                  <Box sx={{
                    position: "absolute", bottom: 10, right: 10,
                    display: "flex", flexDirection: "column", gap: 1, zIndex: 3,
                  }}>
                    <Tooltip title="Share" placement="left">
                      <IconButton sx={{
                        width: 32, height: 32, borderRadius: "8px",
                        background: "rgba(0,0,0,0.55)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#aaa",
                        "&:hover": { border: "1px solid rgba(0,255,150,0.4)", color: "#00ff9f" },
                      }}>
                        <ShareIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Fullscreen" placement="left">
                      <IconButton onClick={openLightbox} sx={{
                        width: 32, height: 32, borderRadius: "8px",
                        background: "rgba(0,0,0,0.55)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#aaa",
                        "&:hover": { border: "1px solid rgba(0,255,150,0.4)", color: "#00ff9f" },
                      }}>
                        <FullscreenIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              <IconButton onClick={next} sx={{ position: "absolute", right: 8, zIndex: 2, p: 0, border: "none", background: "none" }}>
                <img src="/assets/icons/left.svg" alt="next"/>
              </IconButton>

            </Box>
          </Box>

          {/* DOTS */}
          <Box sx={{ display: "flex", gap: 1, pt: 1.5, pl: 1 }}>
            {slides.map((_, i) => (
              <Box key={i} onClick={() => setSlideIndex(i)} sx={{
                width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                transition: "all 0.3s",
                background: i === slideIndex ? "#00ff9f" : "transparent",
                border: i === slideIndex ? "2px solid #00ff9f" : "2px solid #555",
              }} />
            ))}
          </Box>
        </Box>

        {/* DRAGGABLE DIVIDER */}
        <Box
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          sx={{
            width: "18px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "col-resize", zIndex: 2,
            "&:hover .drag-handle": { background: "rgba(0,255,150,0.6)" },
          }}
        >
          <Box className="drag-handle" sx={{
            width: 4, height: 40, borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            transition: "background 0.2s",
          }} />
        </Box>

        {/* RIGHT PANEL - Chatbot (same structure as PortfolioPage) */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Box sx={{ flex: 1, position: "relative" }}>
            {/* Dark bg */}
            <Box sx={{
              position: "absolute", inset: 0,
              background: "rgba(8,12,8,0.85)",
              borderRadius: "12px",
              backdropFilter: "blur(20px)",
              zIndex: 0,
            }} />
            {/* HUD frame — changes per tab */}
            <Box component="img" src={hudBg} alt=""
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 2 }} />

            {/* Orb — changes per tab */}
            <Box sx={{
              position: "absolute", top: -8, right: -8, zIndex: 5,
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(0,205,31,0.25)",
              boxShadow: "0 0 30px rgba(0,205,31,0.2)",
              overflow: "hidden",
            }}>
              <video key={orb} src={orb} autoPlay loop muted playsInline
                style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen", marginLeft: "-30%", marginTop: "-30%" }} />
            </Box>

            {/* Chat content */}
            <Box sx={{ position: "absolute", inset: 0, pt: "100px", pb: "8px", zIndex: 1 }}>
              <ChatbotPanel />
            </Box>
          </Box>
        </Box>

      </Box>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.92)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
        >
          {/* Close */}
          <IconButton onClick={() => setLightboxOpen(false)} sx={{
            position: "absolute", top: 16, right: 16, zIndex: 2,
            color: "#fff", background: "rgba(255,255,255,0.08)",
            "&:hover": { background: "rgba(255,255,255,0.15)" },
          }}>
            <CloseIcon />
          </IconButton>

          {/* Left arrow */}
          <IconButton onClick={lbPrev} sx={{
            position: "absolute", left: 16, zIndex: 2, p: 0, background: "none", border: "none",
          }}>
            <img src="/assets/icons/left.svg" alt="prev" style={{ width: 40, height: 40 }} />
          </IconButton>

          {/* Image */}
          <Box sx={{
            maxWidth: "80vw", maxHeight: "80vh",
            borderRadius: "12px", overflow: "hidden",
            boxShadow: "0 0 60px rgba(0,0,0,0.8)",
          }}>
            <img
              src={slides[lightboxIndex]}
              alt={`slide ${lightboxIndex + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </Box>

          {/* Right arrow */}
          <IconButton onClick={lbNext} sx={{
            position: "absolute", right: 16, zIndex: 2, p: 0, background: "none", border: "none",
          }}>
            <img src="/assets/icons/right.svg" alt="next" style={{ width: 40, height: 40 }} />
          </IconButton>

          {/* Dots */}
          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            {slides.map((_, i) => (
              <Box key={i} onClick={() => setLightboxIndex(i)} sx={{
                width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                transition: "all 0.3s",
                background: i === lightboxIndex ? "#00ff9f" : "transparent",
                border: i === lightboxIndex ? "2px solid #00ff9f" : "2px solid #555",
              }} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
