import { Box, IconButton, Typography, InputBase, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";
import AudioButton from "./AudioButton";

const CATEGORIES = [
  { label: "UI/UX",        route: "UI/UX" },
  { label: "Social Media", route: "Social Media" },
  { label: "Videos",       route: "Video" },
  { label: "Print Media",  route: "Print-Designs" },
];

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled(Box)({
  height: "100vh", width: "100%",
  backgroundImage: "url('/assets/images/bg-images/Background.jpg')",
  backgroundSize: "cover", backgroundPosition: "center",
  backgroundColor: "#05070a",
  position: "relative", overflow: "hidden",
  color: "#fff", display: "flex", flexDirection: "column",
});

const CategoryTab = styled(Box)(({ active }) => ({
  position: "relative",
  padding: "9px 32px 10px",
  fontSize: "13px",
  fontWeight: active ? 600 : 400,
  color: active ? "#00CD1F" : "#555",
  cursor: "pointer",
  whiteSpace: "nowrap",
  letterSpacing: "0.3px",
  transition: "color 0.2s ease",
  marginBottom: "-1px",
  marginRight: "-8px",
  zIndex: active ? 3 : 1,
  userSelect: "none",
  isolation: "isolate",
  "&::before": {
    content: '""', position: "absolute", inset: "-1px",
    clipPath: "polygon(14px 0%, calc(100% - 14px) 0%, 100% 100%, 0% 100%)",
    background: active ? "rgba(0,205,31,0.18)" : "rgba(255,255,255,0.06)",
    zIndex: -1,
  },
  "&::after": {
    content: '""', position: "absolute", inset: 0,
    clipPath: "polygon(14px 0%, calc(100% - 14px) 0%, 100% 100%, 0% 100%)",
    background: active ? "rgba(8,14,8,0.97)" : "rgba(8,10,8,0.55)",
    zIndex: -1,
  },
  "& span": { position: "relative", zIndex: 1 },
  "&:hover": { color: active ? "#00CD1F" : "#888" },
}));

const ActiveTabLine = styled(Box)({
  height: "2px",
  background: "linear-gradient(90deg, transparent 14px, #00CD1F calc(14px), #00CD1F calc(100% - 14px), transparent calc(100% - 14px))",
  position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4, pointerEvents: "none",
});

const ProjectTab = styled(Box)(({ active }) => ({
  padding: "6px 18px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: active ? 600 : 400,
  color: active ? "#00CD1F" : "#666",
  background: active ? "rgba(0,205,31,0.08)" : "transparent",
  border: active ? "1px solid #00CD1F" : "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease",
  "&:hover": { border: "1px solid rgba(0,205,31,0.4)", color: "#ccc" },
}));

const SliderDot = styled(Box)(({ active }) => ({
  width: "10px", height: "10px", borderRadius: "50%",
  background: active ? "#00CD1F" : "transparent",
  border: active ? "none" : "1px solid rgba(255,255,255,0.4)",
  cursor: "pointer", transition: "all 0.2s ease",
  boxShadow: active ? "0 0 6px #00CD1F" : "none",
}));

// ─── Project Data ─────────────────────────────────────────────────────────────

const projectData = {
  "UI/UX": [
    {
      id: 1, name: "Swift",
      slides: [
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
    },
    { id: 2, name: "Project Name Here", slides: ["/assets/images/group.png", "/assets/images/group.png", "/assets/images/group.png"] },
    { id: 3, name: "Project Name Here", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
    { id: 4, name: "Project Name Here", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
  ],
  "Social Media": [
    { id: 1, name: "Project Name Here", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
  ],
  "Print-Designs": [
    { id: 1, name: "Brand Identity", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
    { id: 2, name: "Packaging Design", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
  ],
  "Video": [
    { id: 1, name: "Project Name Here", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
  ],
  "XR": [
    { id: 1, name: "Project Name Here", slides: ["/assets/images/group.png", "/assets/images/group.png"] },
  ],
};

// ─── Chatbot Panel ────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const ProjectDetailPage = () => {
  const { category: rawCategory } = useParams();
  const category = decodeURIComponent(rawCategory || "");
  const navigate = useNavigate();
  const projects = projectData[category] || [];
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const currentProject = projects[currentProjectIndex] || {};
  const slides = currentProject.slides || [];
  const totalSlides = slides.length;

  // Normalize slide
  const rawSlide = slides[currentSlide];
  const slideData = typeof rawSlide === "string" ? { image: rawSlide } : (rawSlide || {});
  const isSplitSlide = !!(slideData.title || slideData.brand);

  const prevSlide = () => setCurrentSlide((s) => (s - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % totalSlides);
  const handleProjectChange = (i) => { setCurrentProjectIndex(i); setCurrentSlide(0); };

  const imageAreaRef = useRef(null);
  useEffect(() => {
    const el = imageAreaRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); e.deltaY > 0 ? nextSlide() : prevSlide(); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  // ── Draggable divider ──────────────────────────────────────────────────────
  const bodyRowRef = useRef(null);
  const [chatWidthPct, setChatWidthPct] = useState(28); // % of body row width
  const dragging = useRef(false);

  const onDividerMouseDown = (e) => { dragging.current = true; e.preventDefault(); };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !bodyRowRef.current) return;
      const rect = bodyRowRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      // chatbot is on the right — pct from right edge
      const pct = Math.min(55, Math.max(18, ((rect.width - x) / rect.width) * 100));
      setChatWidthPct(pct);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <>
      <PageWrapper>
        <AudioButton />

        {/* ══════════ DESKTOP ══════════ */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", height: "100%", p: "20px 20px 16px 20px" }}>

          {/* Top bar: category tabs row */}
          <Box sx={{ display: "flex", alignItems: "flex-end", mb: 0, pl: "2px" }}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.route;
              return (
                <CategoryTab key={cat.route} active={isActive ? 1 : 0}
                  onClick={() => { if (!isActive) navigate(`/portfolio/${encodeURIComponent(cat.route)}`); }}>
                  <span>{cat.label}</span>
                  {isActive && <ActiveTabLine />}
                </CategoryTab>
              );
            })}
          </Box>

          {/* Body row: left arrow + main panel + right arrow + chatbot panel */}
          <Box ref={bodyRowRef} sx={{ flex: 1, display: "flex", alignItems: "stretch", gap: "10px", minHeight: 0 }}>

            {/* Left nav arrow */}
            <Box onClick={prevSlide} sx={{
              width: 28, flexShrink: 0, alignSelf: "center",
              height: 52, borderRadius: "6px",
              background: "rgba(5,10,5,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#00CD1F",
              "&:hover": { background: "rgba(0,205,31,0.08)", borderColor: "rgba(0,205,31,0.65)" },
            }}>
              <Box component="img" src="/assets/icons/right.svg" alt="prev"/>
            </Box>

            {/* Main panel — portfolio-page.svg frame */}
            <Box sx={{ flex: 1, position: "relative", minWidth: 0, minHeight: 0 }}>
              {/* SVG HUD frame */}
              <Box component="img" src="/assets/images/hud/portfolio-page.svg" alt=""
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 2 }} />

              {/* Inner content */}
              <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", p: "14px 16px 40px 16px", zIndex: 1 }}>

                {/* Project tabs row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box onClick={() => navigate("/portfolio")} sx={{
                    width: 28, height: 28, borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff", flexShrink: 0,
                    "&:hover": { background: "rgba(255,255,255,0.08)" },
                  }}>
                    <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
                  </Box>
                  {projects.map((proj, i) => (
                    <ProjectTab key={proj.id} active={i === currentProjectIndex ? 1 : 0} onClick={() => handleProjectChange(i)}>
                      {proj.name || `Project -${i + 1}`}
                    </ProjectTab>
                  ))}
                </Box>

                {/* Slide image area */}
                <Box ref={imageAreaRef} sx={{ flex: 1, minHeight: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSplitSlide ? (
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", height: "100%", gap: 5, px: 2 }}>
                      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
                        <Box component="img" src={slideData.image} alt="slide"
                          sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }} />
                      </Box>
                      <Box sx={{ flex: "0 0 40%", display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {slideData.brand && (
                          <Typography sx={{ fontSize: "14px", color: "#00CD1F", fontWeight: 500 }}>{slideData.brand}</Typography>
                        )}
                        <Typography sx={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.25, color: "#fff", whiteSpace: "pre-line" }}>
                          {slideData.title}
                        </Typography>
                        {slideData.description && (
                          <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, mt: 0.5 }}>
                            <Box component="span" sx={{ color: "#00CD1F", fontWeight: 600 }}>{slideData.brand}</Box>{" "}
                            {slideData.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box component="img" src={slideData.image} alt={`slide-${currentSlide}`}
                      sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }} />
                  )}

                  {/* Expand button */}
                  <Box onClick={() => setExpanded(true)} sx={{
                    position: "absolute", bottom: 8, right: 8,
                    width: 32, height: 32, borderRadius: "6px",
                    background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    "&:hover": { borderColor: "rgba(0,205,31,0.4)" },
                  }}>
                    <Box component="img" src="/assets/images/extend.svg" alt="expand"/>
                  </Box>
                </Box>

                {/* Dots */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8, pt: 1.5 }}>
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Right nav arrow */}
            <Box onClick={nextSlide} sx={{
              width: 28, flexShrink: 0, alignSelf: "center",
              height: 52, borderRadius: "6px",
              background: "rgba(5,10,5,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#00CD1F",
              "&:hover": { background: "rgba(0,205,31,0.08)", borderColor: "rgba(0,205,31,0.65)" },
            }}>
              <Box component="img" src="/assets/icons/left.svg" alt="next"/>
            </Box>

            {/* Draggable divider */}
            <Box
              onMouseDown={onDividerMouseDown}
              onTouchStart={onDividerMouseDown}
              sx={{
                width: "14px", flexShrink: 0, alignSelf: "stretch",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "col-resize", zIndex: 3,
                "&:hover .divider-handle": { background: "rgba(0,205,31,0.7)" },
              }}
            >
              <Box className="divider-handle" sx={{
                width: 3, height: 48, borderRadius: 2,
                background: "rgba(255,255,255,0.15)",
                transition: "background 0.2s",
              }} />
            </Box>

            {/* Chatbot panel — portfolio-chantbot.svg frame */}
            <Box sx={{ width: `${chatWidthPct}%`, flexShrink: 0, position: "relative" }}>
              {/* SVG HUD frame */}
              <Box component="img" src="/assets/images/hud/portfolio-chantbot.svg" alt=""
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 2 }} />

              {/* Orb — top-right circular cutout of the chatbot SVG */}
              <Box sx={{
                position: "absolute", top: -6, right: -6, zIndex: 5,
                width: 110, height: 110, borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(0,205,31,0.3)",
                boxShadow: "0 0 24px rgba(0,205,31,0.25)",
                overflow: "hidden",
              }}>
                <video src="/assets/orb/Welcome-state.mp4" autoPlay loop muted playsInline
                  style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen", marginLeft: "-30%", marginTop: "-30%" }} />
              </Box>

              {/* Chat content */}
              <Box sx={{ position: "absolute", inset: 0, pt: "120px", pb: "8px", zIndex: 1 }}>
                <ChatbotPanel />
              </Box>
            </Box>

          </Box>
        </Box>

        {/* ══════════ MOBILE ══════════ */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", height: "100%", px: 2, pt: 2.5, pb: 2 }}>
          {/* Category tabs */}
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0, overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
            <Box onClick={() => navigate("/")} sx={{
              px: 2, py: 1, mr: 1, borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "11px", color: "#aaa", cursor: "pointer", whiteSpace: "nowrap", alignSelf: "center",
            }}>← Menu</Box>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.route;
              return (
                <CategoryTab key={cat.route} active={isActive ? 1 : 0}
                  onClick={() => { if (!isActive) navigate(`/portfolio/${encodeURIComponent(cat.route)}`); }}
                  sx={{ fontSize: "11px", padding: "7px 16px" }}>
                  <span>{cat.label}</span>
                  {isActive && <ActiveTabLine />}
                </CategoryTab>
              );
            })}
          </Box>

          {/* Card */}
          <Box sx={{
            flex: 1, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0 16px 16px 16px",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)",
            display: "flex", flexDirection: "column", p: 2, overflow: "hidden", position: "relative", zIndex: 1,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, overflowX: "auto", pb: 0.5 }}>
              <Box onClick={() => navigate("/portfolio")} sx={{
                width: 28, height: 28, borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}>
                <ArrowBackIosNewIcon sx={{ fontSize: 11, color: "#fff" }} />
              </Box>
              {projects.map((proj, i) => (
                <ProjectTab key={proj.id} active={i === currentProjectIndex ? 1 : 0} onClick={() => handleProjectChange(i)}
                  sx={{ fontSize: "11px", padding: "5px 14px" }}>
                  {proj.name || `Project -${i + 1}`}
                </ProjectTab>
              ))}
            </Box>

            <Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", minHeight: 0, mb: 1.5 }}>
              <Box onClick={prevSlide} sx={{ position: "absolute", left: 0, zIndex: 2, width: 28, height: 44, borderRadius: "6px", background: "rgba(5,10,5,0.75)", border: "1px solid rgba(0,205,31,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Box component="img" src="/assets/icons/right.svg" alt="prev"/>
              </Box>
              <Box sx={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "10px", overflow: "hidden", height: "100%", mx: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box component="img" src={slideData.image} alt={`slide-${currentSlide}`} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </Box>
              <Box onClick={nextSlide} sx={{ position: "absolute", right: 0, zIndex: 2, width: 28, height: 44, borderRadius: "6px", background: "rgba(5,10,5,0.75)", border: "1px solid rgba(0,205,31,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Box component="img" src="/assets/icons/right.svg" alt="next" />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8, mb: 1 }}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
              ))}
            </Box>
          </Box>
        </Box>
      </PageWrapper>

      {/* ══════════ FULLSCREEN OVERLAY ══════════ */}
      {expanded && (
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 9999,
          backgroundImage: "url('/assets/images/bg-images/bg.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 1400, gap: 1.5, px: 2 }}>
            <Box onClick={prevSlide} sx={{ width: 28, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,10,5,0.75)", borderRadius: "6px", cursor: "pointer" }}>
              <Box component="img" src="/assets/icons/right.svg" alt="prev" />
            </Box>
            <Box sx={{
              flex: 1, aspectRatio: "16/9",
              backgroundImage: "url('/assets/images/bg-images/extend-screen.svg')",
              backgroundSize: "cover", backgroundPosition: "center",
              borderRadius: "12px", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <Box component="img" src={slideData.image} alt={`slide-${currentSlide}`} sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              <Box onClick={() => setExpanded(false)} sx={{
                position: "absolute", bottom: 50,right: 20,
                width: 34, height: 34, borderRadius: "6px", background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <Box component="img" src="/assets/images/extend.svg" alt="minimize" sx={{ transform: "rotate(180deg)" }} />
              </Box>
            </Box>
            <Box onClick={nextSlide} sx={{ width: 28, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,10,5,0.75)", borderRadius: "6px", cursor: "pointer" }}>
              <Box component="img" src="/assets/icons/left.svg" alt="next" />
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8 }}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ProjectDetailPage;
