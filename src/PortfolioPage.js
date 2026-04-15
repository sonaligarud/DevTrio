import { Box, Button, Typography, IconButton, InputBase, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AudioButton from "./AudioButton";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";

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

const CategoryCard = styled(Box)({
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  backdropFilter: "blur(12px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  cursor: "pointer",
  transition: "all 0.25s ease",
  "&:hover": {
    border: "1px solid rgba(0,205,31,0.45)",
    boxShadow: "0 0 18px rgba(0,205,31,0.12)",
    background: "rgba(0,205,31,0.04)",
  },
});

// Mobile pill tab
const PillTab = styled(Button)(({ active }) => ({
  borderRadius: "20px",
  padding: "6px 22px",
  textTransform: "none",
  fontSize: "12px",
  border: active ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.15)",
  color: active ? "#fff" : "#666",
  background: active ? "rgba(255,255,255,0.06)" : "transparent",
  minWidth: 0,
  "&:hover": { background: "rgba(255,255,255,0.08)" },
}));

const CATEGORIES = [
  { label: "UI/UX",        route: "UI/UX" },
  { label: "Social Media", route: "Social Media" },
  { label: "Videos",       route: "Video" },
  { label: "Print Media",  route: "Print-Designs" },
];

const desktopCategories = [
  { label: "Print-Designs", icon: "/assets/icons/print-designs.svg" },
  { label: "Social Media",  icon: "/assets/icons/social-media.svg" },
  { label: "UI/UX",         icon: "/assets/icons/UX.svg" },
  { label: "Video",         icon: "/assets/icons/Video.svg" },
  { label: "XR",            icon: "/assets/icons/XR.svg" },
];

const mobileCategories = [
  { label: "UI/UX",         icon: "/assets/icons/UX.svg" },
  { label: "Social Media",  icon: "/assets/icons/social-media.svg" },
  { label: "XR",            icon: "/assets/icons/XR.svg" },
  { label: "Video",         icon: "/assets/icons/Video.svg" },
  { label: "Print-Designs", icon: "/assets/icons/print-designs.svg" },
];

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

const PortfolioPage = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <AudioButton />

      {/* ══════════════ DESKTOP ══════════════ */}
      <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", height: "100%", p: "16px", position: "relative", zIndex: 1 }}>

        {/* Row 1: Category tabs — same as ProjectDetailPage */}
        <Box sx={{ display: "flex", alignItems: "flex-end", mb: 0, pl: "2px", flexShrink: 0 }}>
          {CATEGORIES.map((cat) => (
            <CategoryTab key={cat.route} active={0}
              onClick={() => navigate(`/portfolio/${encodeURIComponent(cat.route)}`)}>
              <span>{cat.label}</span>
            </CategoryTab>
          ))}
        </Box>

        {/* Row 2: Body — main panel + chatbot */}
        <Box sx={{ flex: 1, display: "flex", gap: "10px", minHeight: 0 }}>

          {/* ── Col 8: Main panel ── */}
          <Box sx={{ flex: 1, position: "relative", minWidth: 0, minHeight: 0 }}>
            {/* Dark bg */}
            <Box sx={{
              position: "absolute", inset: 0,
              background: "rgba(8,12,8,0.85)",
              borderRadius: "0 12px 12px 12px",
              backdropFilter: "blur(20px)",
              zIndex: 0,
            }} />
            {/* HUD frame */}
            <Box component="img" src="/assets/images/hud/portfolio-page.svg" alt=""
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 2 }} />

            {/* Inner content */}
            <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", p: "12px 16px 36px 16px", zIndex: 1 }}>

              {/* Back button row — same style as project tabs row */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexShrink: 0 }}>
                <Box onClick={() => navigate('/')} sx={{
                  width: 28, height: 28, borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff", flexShrink: 0,
                  "&:hover": { background: "rgba(255,255,255,0.08)" },
                }}>
                  <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
                </Box>
                <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
                  Welcome!
                </Typography>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                  Here is my work
                </Typography>
              </Box>

              {/* Category grid */}
              <Box sx={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 175px)",
                  gridTemplateRows: "repeat(3, 115px)",
                  gap: "14px",
                }}>
                  {desktopCategories.map((cat, i) => (
                    <CategoryCard
                      key={i}
                      onClick={() => navigate(`/portfolio/${encodeURIComponent(cat.label)}`)}
                      sx={{ ...(i === 4 && { gridColumn: "1 / 2" }) }}
                    >
                      <Box component="img" src={cat.icon} alt={cat.label} sx={{ width: 36, height: 36, objectFit: "contain" }} />
                      <Typography sx={{ fontSize: "11px", color: "#bbb", letterSpacing: "0.5px", fontWeight: 500 }}>
                        {cat.label}
                      </Typography>
                    </CategoryCard>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── Col 3: Chatbot panel ── */}
          <Box sx={{ width: "28%", flexShrink: 0, position: "relative" }}>
            {/* Dark bg */}
            <Box sx={{
              position: "absolute", inset: 0,
              background: "rgba(8,12,8,0.85)",
              borderRadius: "12px",
              backdropFilter: "blur(20px)",
              zIndex: 0,
            }} />
            {/* HUD frame */}
            <Box component="img" src="/assets/images/hud/portfolio-chantbot.svg" alt=""
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 2 }} />

            {/* Orb */}
            <Box sx={{
              position: "absolute", top: -8, right: -8, zIndex: 5,
              width: 120, height: 120, borderRadius: "50%",
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(0,205,31,0.25)",
              boxShadow: "0 0 30px rgba(0,205,31,0.2)",
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

      {/* ══════════════ MOBILE ══════════════ */}
      <Box sx={{
        display: { xs: "flex", md: "none" },
        flexDirection: "column",
        height: "100%",
        px: 2, pt: 2.5, pb: 2,
        position: "relative", zIndex: 1,
      }}>
        {/* Pill tabs */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <PillTab active={1} onClick={() => navigate('/')}>Main Menu</PillTab>
          <PillTab active={1} onClick={() => navigate('/')}>AI Mode</PillTab>
        </Box>

        {/* Card */}
        <Box sx={{
          flex: 1,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          px: 2.5, pt: 3, pb: 2.5,
          overflow: "hidden",
        }}>
          <Box component="img" src="/assets/images/hud/project-detail-Page.svg" alt=""
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 0 }} />

          <Box sx={{ mb: 2.5, zIndex: 1 }}>
            <Typography sx={{ fontSize: "12px", textAlign: "left" }}>Welcome!</Typography>
            <Typography sx={{ fontSize: "22px", fontWeight: 700, textAlign: "left" }}>Here is my work</Typography>
          </Box>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "90px",
            gap: "10px",
            flex: 1, zIndex: 1,
          }}>
            {mobileCategories.map((cat, i) => (
              <CategoryCard
                key={i}
                onClick={() => navigate(`/portfolio/${encodeURIComponent(cat.label)}`)}
                sx={{ ...(i === 4 && { gridColumn: "1 / 2" }) }}
              >
                <Box component="img" src={cat.icon} alt={cat.label} sx={{ width: 32, height: 32, objectFit: "contain" }} />
                <Typography sx={{ fontSize: "10px", color: "#aaa", letterSpacing: "0.5px" }}>{cat.label}</Typography>
              </CategoryCard>
            ))}
          </Box>
        </Box>
      </Box>

    </PageWrapper>
  );
};

export default PortfolioPage;
