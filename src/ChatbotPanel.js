import { useState } from "react";
import { Box, Typography, InputBase, IconButton, CircularProgress } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import CustomTooltip from "./CustomTooltip";
import { useChatContext } from "./ChatContext";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";

const PRIMARY = "#00CD1F";
const CHIP_BG = "#8F8F8F";


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
  const { messages, isLoading, sendMessage, messagesEndRef } = useChatContext();
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
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", ...wrapperSx }}>

      {/* Orb — top-right, overflows the frame */}
      <CustomTooltip title={
        <>Ask anything<br />about me<br /><span style={{ color: "#00d2ff", textDecoration: "underline", cursor: "pointer" }}>clicking here</span></>
      } placement="left">
        <Box sx={{
          position: "absolute",
          top: -44, right: -44,
          width: 110, height: 110,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          border: "1.5px solid rgba(0,255,150,0.3)",
          boxShadow: "0 0 32px rgba(0,255,150,0.2), inset 0 0 20px rgba(0,255,150,0.07)",
          overflow: "hidden",
          zIndex: 20,
          flexShrink: 0,
        }}>
          <video key={orb} src={orb} autoPlay loop muted playsInline
            style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen", marginLeft: "-30%", marginTop: "-30%" }} />
        </Box>
      </CustomTooltip>

      {/* HUD frame + content */}
      <Box sx={{
        flex: 1,
        display: "flex", flexDirection: "column",
        background: "rgba(10,14,10,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        clipPath:
      "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
        background: "linear-gradient(#0b0b0b, #0b0b0b) padding-box, linear-gradient(124deg, #131010e3 1%, #636363 40%, #00CD1F 67%, #636363 47%, #131010e3 97%) border-box"
      }}>
        {/* Messages area */}
        <Box sx={{
          flex: 1, overflowY: "auto",
          pt: "20px", px: "20px", pb: "8px",
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "2px" },
          textAlign:"left"
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
                I'm <span style={{ color: '#fff', fontWeight: 700 }}>Nova</span>, Akash's AI Assistant.<br />
                I can walk you through projects, thinking, and decisions.<br />
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
                color: "#000000",
                fontSize: "12px", fontWeight: 600,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s"
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
