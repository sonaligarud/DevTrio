import { useState } from "react";
import { Box, Typography, InputBase, IconButton, CircularProgress } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import { useChat } from "./hooks/useChat";
import { useSpeech } from "./hooks/useSpeech";
import { transcribeAudio } from "./api/chatApi";

const PRIMARY = "#8f8f8f";

/**
 * Shared chatbot panel used on homepage and project detail page.
 * Props:
 *   orb        — path to orb video (default: Welcome-state.mp4)
 *   hudBg      — path to HUD frame SVG overlay
 *   chips      — array of suggestion chip labels
 *   wrapperSx  — extra sx for the outer wrapper Box
 */
export default function ChatbotPanel({
  orb = "/assets/orb/Idle State.mp4",
  hudBg = "/assets/images/hud/homepage-rightside.svg",
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
    <Box sx={{
      height: "100%",
      display: "flex", flexDirection: "column",
      backgroundImage: `url(${hudBg})`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      borderRadius: "0 16px 16px 0",
      overflow: "hidden",
      position: "relative",
      ...wrapperSx,
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
        <video key={orb} src={orb} autoPlay loop muted playsInline
          style={{ width: "160%", height: "160%", objectFit: "cover", mixBlendMode: "screen" }} />
      </Box>

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Messages */}
        <Box sx={{
          flex: 1, overflowY: "auto", p: "24px 24px 0",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "2px" },
        }}>
          {messages.length === 0 ? (
            <Box sx={{ mt: 6 }}>
              <Typography sx={{ fontSize: "13px", lineHeight: 1.7 }}>
                Hi!<br />
                I'm <span style={{ color: PRIMARY, fontWeight: 600 }}>Nova</span>, Akash's AI Assistant.<br />
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
              {isLoading && <CircularProgress size={18} sx={{ color: PRIMARY, alignSelf: "flex-start" }} />}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* Suggestion chips */}
        {messages.length === 0 && (
          <Box sx={{ display: "flex", gap: 1, px: 3, pb: 1.5, flexWrap: "wrap" }}>
            {chips.map((s) => (
              <Box key={s} onClick={() => sendMessage(s)} sx={{
                px: 2, py: 0.8, borderRadius: "20px",
                background: PRIMARY, color: "#000",
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
              sx={{ color: "#aaa", fontSize: "13px", "& input::placeholder": { color: isListening ? PRIMARY : "#555", opacity: 1 } }}
            />
            <IconButton onClick={toggleListening} size="small" sx={{ color: isListening ? PRIMARY : "#666", p: "4px" }}>
              <MicIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton onClick={handleSend} size="small" disabled={isLoading || isProcessing}
              sx={{
                background: PRIMARY, color: "#000", borderRadius: "8px", p: "4px",
                "&:hover": { background: "#00e68a" }, "&.Mui-disabled": { background: "rgba(0,255,150,0.2)" },
              }}>
              {isLoading || isProcessing
                ? <CircularProgress size={16} sx={{ color: "#000" }} />
                : <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
