import { Box, IconButton, Typography, InputBase, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";
import AudioButton from "./AudioButton";

// ─── Category tabs config ─────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "UI/UX",         route: "UI/UX" },
  { label: "Social Media",  route: "Social Media" },
  { label: "Videos",        route: "Video" },
  { label: "Print Media",   route: "Print-Designs" },
];

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled(Box)({
  height: "100vh",
  width: "100%",
  backgroundImage: "url('/assets/images/bg-images/Background.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#05070a",
  position: "relative",
  overflow: "hidden",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
});

const MainMenuChip = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "7px 28px 7px 14px",
  background: "rgba(30,34,40,0.95)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "8px 0 0 8px",
  fontSize: "13px",
  color: "#fff",
  cursor: "pointer",
  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
  "&:hover": { background: "rgba(50,55,62,0.95)" },
});


const ProjectTab = styled(Box)(({ active }) => ({
  padding: "6px 20px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: active ? 600 : 400,
  color: active ? "#00cd1f" : "#888",
  background: active ? "rgba(184,255,110,0.08)" : "transparent",
  border: active ? "1px solid #00cd1f" : "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.2s ease",
  "&:hover": { border: "1px solid rgba(184,255,110,0.3)", color: "#ccc" },
}));

const NavArrowBtn = styled(IconButton)({
  width: "28px",
  height: "52px",
  background: "rgba(5,10,5,0.75)",
  border: "1px solid rgba(0,205,31,0.35)",
  color: "#00cd1f",
  borderRadius: "6px",
  flexShrink: 0,
  "&:hover": {
    background: "rgba(0,205,31,0.08)",
    borderColor: "rgba(0,205,31,0.65)",
    boxShadow: "0 0 8px rgba(0,205,31,0.2)",
  },
});

// Tab shape matching the screenshot: trapezoid — angled left/right sides, flat top
// Active: green text + green bottom accent line. Inactive: dim gray.
const CategoryTab = styled(Box)(({ active }) => ({
  position: "relative",
  padding: "10px 34px 11px",
  fontSize: "13px",
  fontWeight: active ? 600 : 400,
  color: active ? "#b8ff6e" : "#555",
  cursor: "pointer",
  whiteSpace: "nowrap",
  letterSpacing: "0.3px",
  transition: "color 0.2s ease",
  marginBottom: "-1px",
  marginRight: "-8px",
  zIndex: active ? 3 : 1,
  userSelect: "none",
  isolation: "isolate",
  // Border layer (slightly larger, same clip shape)
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "-1px",
    clipPath: "polygon(14px 0%, calc(100% - 14px) 0%, 100% 100%, 0% 100%)",
    background: active
      ? "rgba(184,255,110,0.25)"
      : "rgba(255,255,255,0.07)",
    zIndex: -1,
  },
  // Fill layer
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    clipPath: "polygon(14px 0%, calc(100% - 14px) 0%, 100% 100%, 0% 100%)",
    background: active
      ? "rgba(12,18,10,0.97)"
      : "rgba(8,10,8,0.55)",
    zIndex: -1,
  },
  "& span": { position: "relative", zIndex: 1 },
  "&:hover": { color: active ? "#b8ff6e" : "#888" },
  "&:hover::after": {
    background: active ? "rgba(12,18,10,0.97)" : "rgba(14,17,14,0.8)",
  },
}));

// Green bottom accent line shown under the active tab
const ActiveTabLine = styled(Box)({
  height: "2px",
  background: "linear-gradient(90deg, transparent 14px, #00cd1f calc(14px), #00cd1f calc(100% - 14px), transparent calc(100% - 14px))",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 4,
  pointerEvents: "none",
});

const SliderDot = styled(Box)(({ active }) => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: active ? "#00cd1f" : "",
  border: active ? "" : "solid 1px #ddd",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: active ? "0 0 8px #00cd1f" : "none",
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const projectData = {
  "UI/UX": [
    {
      id: 1, label: "UI/UX", name: "Swift",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
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
    {
      id: 2, label: "UI/UX", name: "Project Name Here",
      description: "Dashboard redesign for analytics platform with improved data visualization.",
      slides: ["/assets/images/group.png", "/assets/images/group.png", "/assets/images/group.png"],
    },
    {
      id: 3, label: "UI/UX", name: "Project Name Here",
      description: "E-commerce mobile application design with seamless checkout flow.",
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
    {
      id: 4, label: "UI/UX", name: "Project Name Here",
      description: "Onboarding flow redesign for SaaS product improving user activation.",
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "Social Media": [
    {
      id: 1, label: "Social Media", name: "Project Name Here",
      description: "Instagram campaign for product launch.",
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "Print-Designs": [
    {
      id: 1, label: "Print", name: "Project Name Here",
      description: "Complete brand identity package.",
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "Video": [
    {
      id: 1, label: "Video", name: "Project Name Here",
      description: "Animated explainer video for product demo.",
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "XR": [
    {
      id: 1, label: "XR", name: "Project Name Here",
      description: "Immersive virtual reality environment design.",
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
};

// ─── Inline Chatbot Panel ─────────────────────────────────────────────────────

function ChatbotPanel({ onNavigate }) {
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
      display: "flex", flexDirection: "column", height: "100%",
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 6 }}>
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
          {["View Case Study", "About Akash"].map((s) => (
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

// ─── Minimized Orb Button ─────────────────────────────────────────────────────

function OrbButton({ onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "fixed", top: 20, right: 20, zIndex: 200,
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(0,255,150,0.4)",
        boxShadow: "0 0 24px rgba(0,255,150,0.25)",
        overflow: "hidden", cursor: "pointer",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 0 36px rgba(0,255,150,0.45)" },
      }}
    >
      <video src="/assets/orb/Welcome-state.mp4" autoPlay loop muted playsInline
        style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen", marginLeft: "-30%", marginTop: "-30%" }} />
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProjectDetailPage = () => {
  const { category: rawCategory } = useParams();
  const category = decodeURIComponent(rawCategory || "");
  const navigate = useNavigate();
  const projects = projectData[category] || [];
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const currentProject = projects[currentProjectIndex] || {};
  const slides = currentProject.slides || [];
  const totalSlides = slides.length;

  const prevSlide = () => setCurrentSlide((s) => (s - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % totalSlides);

  const handleProjectChange = (i) => {
    setCurrentProjectIndex(i);
    setCurrentSlide(0);
  };

  // scroll on image area to navigate slides
  const imageAreaRef = useRef(null);
  useEffect(() => {
    const el = imageAreaRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) nextSlide();
      else prevSlide();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  return (
    <>
    <PageWrapper>
      <AudioButton />
      {/* ══════════════ DESKTOP ══════════════ */}
      <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", height: "100%", p: "24px 28px 24px" }}>

        {/* Top row: Main Menu chip + Category tabs */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0, mb: 0 }}>
          {/* Main Menu back chip */}
          <MainMenuChip onClick={() => navigate("/")} sx={{ mb: "1px", mr: 1.5, alignSelf: "center" }}>
            Main Menu
          </MainMenuChip>

          {/* Category tabs */}
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0, overflow: "visible" }}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.route;
              return (
                <CategoryTab
                  key={cat.route}
                  active={isActive ? 1 : 0}
                  onClick={() => {
                    if (!isActive) navigate(`/portfolio/${encodeURIComponent(cat.route)}`);
                  }}
                >
                  <span>{cat.label}</span>
                  {isActive && <ActiveTabLine />}
                </CategoryTab>
              );
            })}
          </Box>
        </Box>

        {/* Main card */}
        <Box sx={{
          flex: 1,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "0 16px 16px 16px",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(28px)",
          position: "relative", display: "flex", flexDirection: "column",
          overflow: "hidden", p: "20px 24px 16px",
          zIndex: 1,
        }}>
          {/* Project tabs row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box onClick={() => navigate("/portfolio")} sx={{
              width: 30, height: 30, borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", flexShrink: 0,
              "&:hover": { background: "rgba(255,255,255,0.08)" },
            }}>
              <ArrowBackIosNewIcon sx={{ fontSize: 13 }} />
            </Box>
            {projects.map((proj, i) => (
              <ProjectTab key={proj.id} active={i === currentProjectIndex ? 1 : 0} onClick={() => handleProjectChange(i)}>
                Project -{i + 1}
              </ProjectTab>
            ))}
          </Box>

          {/* Content: image left + chatbot right */}
          <Box sx={{ flex: 1, display: "flex", gap: 0, minHeight: 0 }}>

            {/* Left arrow — outside image panel */}
            <NavArrowBtn onClick={prevSlide} sx={{ borderRadius: "6px 0 0 6px", borderRight: "none" }}>
              <Box component="img" src="/assets/icons/left.svg" alt="prev"/>
            </NavArrowBtn>

            {/* Left: image viewer */}
            <Box
              ref={imageAreaRef}
              sx={{
                flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: "none", borderRight: "none",
                background: "rgba(0,0,0,0.3)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Image */}
              <Box sx={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                p: 3, minHeight: 0,
              }}>
                <Box
                  component="img"
                  src={slides[currentSlide]}
                  alt={`slide-${currentSlide}`}
                  sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }}
                />
              </Box>

              {/* Expand + dots row */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8, pb: 1.5, position: "relative" }}>
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
                ))}
                <Box sx={{
                  position: "absolute", right: 50, bottom: 100,
                  borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }} onClick={() => setExpanded(true)}>
                  <Box component="img" src="/assets/images/extend.svg" alt="expand" />
                </Box>
              </Box>
            </Box>

            {/* Right arrow — outside image panel */}
            <NavArrowBtn onClick={nextSlide} sx={{
              borderRadius: chatOpen ? "0" : "0 6px 6px 0",
              borderLeft: "none",
              borderRight: chatOpen ? "none" : "1px solid rgba(0,205,31,0.35)",
            }}>
              <Box component="img" src="/assets/icons/left.svg" alt="next"/>
            </NavArrowBtn>

            {/* Right: chatbot panel (collapsible) */}
            <Box sx={{
              width: chatOpen ? "320px" : 0,
              flexShrink: 0,
              overflow: "hidden",
              transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {chatOpen && <ChatbotPanel />}
            </Box>

            {/* Toggle tab on the right edge */}
            <Box
              onClick={() => setChatOpen((o) => !o)}
              sx={{
                width: 20, flexShrink: 0, alignSelf: "stretch",
                background: "rgba(0,255,150,0.06)",
                border: "1px solid rgba(0,255,150,0.15)",
                borderLeft: "none",
                borderRadius: "0 8px 8px 0",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
                "&:hover": { background: "rgba(0,255,150,0.12)" },
              }}
            >
              <Box sx={{
                width: 3, height: 32, borderRadius: 2,
                background: "rgba(0,255,150,0.4)",
              }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════ MOBILE ══════════════ */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", height: "100%", px: 2, pt: 2.5, pb: 2 }}>

        {/* Category tabs (scrollable) */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0, overflowX: "auto", pb: 0, mb: 0,
          "&::-webkit-scrollbar": { display: "none" } }}>
          <Box onClick={() => navigate("/")} sx={{
            px: 2, py: 1, mr: 1, borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: "11px", color: "#aaa", cursor: "pointer", whiteSpace: "nowrap",
            alignSelf: "center",
            "&:hover": { color: "#fff" },
          }}>← Menu</Box>
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.route;
            return (
              <CategoryTab
                key={cat.route}
                active={isActive ? 1 : 0}
                onClick={() => { if (!isActive) navigate(`/portfolio/${encodeURIComponent(cat.route)}`); }}
                sx={{ fontSize: "11px", padding: "7px 16px" }}
              >
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
          display: "flex", flexDirection: "column", p: 2, overflow: "hidden", position: "relative",
          zIndex: 1,
        }}>
          {/* Project tabs */}
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
                Project -{i + 1}
              </ProjectTab>
            ))}
          </Box>

          {/* Image viewer */}
          <Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", minHeight: 0, mb: 1.5 }}>
            <NavArrowBtn onClick={prevSlide} sx={{ position: "absolute", left: 10, zIndex: 2}}>
              <Box component="img" src="/assets/icons/left.svg" alt="prev"/>
            </NavArrowBtn>
            <Box sx={{
              flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "10px", overflow: "hidden",
              height: "100%", mx: "18px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box component="img" src={slides[currentSlide]} alt={`slide-${currentSlide}`}
                sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
            <NavArrowBtn onClick={nextSlide} sx={{ position: "absolute", right: 10, zIndex: 2}}>
              <Box component="img" src="/assets/icons/left.svg" alt="next"/>
            </NavArrowBtn>
          </Box>

          {/* Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8, mb: 1.5 }}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
            ))}
          </Box>
        </Box>

        {/* Mobile: floating orb to open chatbot */}
        {!chatOpen && <OrbButton onClick={() => setChatOpen(true)} />}

        {/* Mobile chatbot overlay */}
        {chatOpen && (
          <Box sx={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
            display: "flex", flexDirection: "column",
            p: 2, pt: 4,
          }} onClick={(e) => { if (e.target === e.currentTarget) setChatOpen(false); }}>
            <Box sx={{ flex: 1, borderRadius: "16px", overflow: "hidden", maxHeight: "80vh", mt: "auto" }}>
              <ChatbotPanel />
            </Box>
          </Box>
        )}
      </Box>
    </PageWrapper>

      {/* ══════════════ FULLSCREEN OVERLAY ══════════════ */}
      {expanded && (
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 9999,
          backgroundImage: "url('/assets/images/bg-images/bg.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 1.5,
        }}>
          {/* Row: left arrow + slider box + right arrow */}
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 1500, gap: 1.5 }}>

            {/* Left arrow */}
            <Box onClick={prevSlide} sx={{
              width: 28, height: 52, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(5,10,5,0.75)",
              borderRadius: "6px", cursor: "pointer",
            }}>
              <Box component="img" src="/assets/icons/right.svg" alt="prev"/>
            </Box>

            {/* Slider box with extend-screen.svg background */}
            <Box sx={{
              flex: 1,
              aspectRatio: "16/9",
              backgroundImage: "url('/assets/images/bg-images/extend-screen.svg')",
              backgroundSize: "cover", backgroundPosition: "center",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <Box
                component="img"
                src={slides[currentSlide]}
                alt={`slide-${currentSlide}`}
                sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />

              {/* Minimize icon — bottom right of slider */}
              <Box onClick={() => setExpanded(false)} sx={{
                position: "absolute", bottom: 50, right: 50,
                width: 34, height: 34, borderRadius: "6px",
                background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
                <Box component="img" src="/assets/images/extend.svg" alt="minimize" sx={{ transform: "rotate(180deg)" }} />
              </Box>
            </Box>

            {/* Right arrow */}
            <Box onClick={nextSlide} sx={{
              width: 28, height: 52, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(5,10,5,0.75)",
              borderRadius: "6px", cursor: "pointer",
            }}>
              <Box component="img" src="/assets/icons/left.svg" alt="next" />
            </Box>
          </Box>

          {/* Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.8 }}>
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
