import { useState } from "react";
import { Box, Typography, InputBase, IconButton, CircularProgress } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";

const PRIMARY = "#00ff9c";
const CHIP_BG = "rgba(30,35,30,0.9)";

/**
 * Shared chatbot panel — homepage right col & project detail right panel.
 * Props:
 *   orb       — orb video src
 *   hudBg     — HUD frame SVG (default: portfolio-chantbot.svg matches design)
 *   chips     — suggestion chip labels
 *   wrapperSx — extra sx on outer wrapper
 */
export default function ChatbotPanel({
  orb = "/assets/orb/Idle State.mp4",
  hudBg = "/assets/images/hud/portfolio-chantbot.svg",
  chips = ["View Case Study", "How I Design", "Start Chat"],
  wrapperSx = {},
}) {
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
    /* Outer wrapper — position:relative so orb can overflow */
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", ...wrapperSx }}>

      {/* Orb — top-right, overflows the frame */}
      <Box sx={{
        position: "absolute",
        top: -38, right: -38,
        width: 100, height: 100,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.55)",
        border: "1.5px solid rgba(0,255,150,0.35)",
        boxShadow: "0 0 28px rgba(0,255,150,0.25), inset 0 0 18px rgba(0,255,150,0.08)",
        overflow: "hidden",
        zIndex: 20,
        flexShrink: 0,
      }}>
        <video key={orb} src={orb} autoPlay loop muted playsInline
          style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen", marginLeft: "-30%", marginTop: "-30%" }} />
      </Box>

      {/* HUD frame + content */}
      <Box sx={{
        flex: 1,
        display: "flex", flexDirection: "column",
        backgroundImage: `url(${hudBg})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Messages area */}
        <Box sx={{
          flex: 1, overflowY: "auto",
          pt: "56px", px: "20px", pb: "8px",
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "2px" },
        }}>
          {messages.length === 0 ? (
            /* Greeting bubble */
            <Box sx={{
              background: "rgba(20,26,20,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              p: "14px 16px",
              mb: 1.5,
            }}>
              <Typography sx={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(255,255,255,0.85)" }}>
                Hi!<br />
                I'm <span style={{ color: PRIMARY, fontWeight: 700 }}>Nova</span>, Akash's AI Assistant.<br />
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
                  background: msg.role === "user" ? "rgba(0,255,150,0.08)" : "rgba(20,26,20,0.85)",
                  border: msg.role === "user" ? "1px solid rgba(0,255,150,0.2)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px", px: "14px", py: "10px",
                  maxWidth: "88%", color: "#fff", fontSize: "13px", lineHeight: 1.6,
                }}>{msg.content}</Box>
              ))}
              {isLoading && <CircularProgress size={16} sx={{ color: PRIMARY, alignSelf: "flex-start", mt: 0.5 }} />}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* Suggestion chips */}
        {messages.length === 0 && (
          <Box sx={{ display: "flex", gap: "8px", px: "20px", pb: "10px", flexWrap: "wrap" }}>
            {chips.map((s) => (
              <Box key={s} onClick={() => sendMessage(s)} sx={{
                px: "14px", py: "7px",
                borderRadius: "20px",
                background: CHIP_BG,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "11px", fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
                "&:hover": { borderColor: PRIMARY, color: PRIMARY },
              }}>{s}</Box>
            ))}
          </Box>
        )}

        {/* Input bar */}
        <Box sx={{ px: "16px", pb: "16px", pt: "6px" }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(8,12,8,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            px: "14px", py: "8px",
          }}>
            <InputBase
              placeholder={isListening ? "Listening..." + (interimText ? ` ${interimText}` : "") : "Ask anything"}
              fullWidth value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading || isProcessing}
              sx={{
                color: "#ccc", fontSize: "13px",
                "& input::placeholder": { color: isListening ? PRIMARY : "rgba(255,255,255,0.3)", opacity: 1 },
              }}
            />
            <IconButton onClick={toggleListening} size="small"
              sx={{ color: isListening ? PRIMARY : "rgba(255,255,255,0.35)", p: "4px", flexShrink: 0 }}>
              <MicIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton onClick={handleSend} size="small" disabled={isLoading || isProcessing}
              sx={{
                background: PRIMARY, color: "#000", borderRadius: "8px", p: "5px", flexShrink: 0,
                "&:hover": { background: "#00e68a" },
                "&.Mui-disabled": { background: "rgba(0,255,150,0.15)", color: "rgba(0,0,0,0.4)" },
              }}>
              {isLoading || isProcessing
                ? <CircularProgress size={15} sx={{ color: "#000" }} />
                : <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
