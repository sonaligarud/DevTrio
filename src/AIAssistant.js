import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { useSpeech } from "./hooks/useSpeech";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

// ─────────────────────────────────────────
// Styled components
// ─────────────────────────────────────────

const Overlay = styled(motion.div)({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
});

const Container = styled(motion.div)({
    position: "relative",
    width: "82%",
    maxWidth: "1100px",
    height: "72vh",
    minHeight: "520px",
    borderRadius: "16px",
    background: "rgba(8, 10, 12, 0.75)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "0 0 60px rgba(0,255,156,0.04)",
    display: "flex",
    flexDirection: "column",
    clipPath:
        "polygon(0 40px, 40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)",
});

const TabsContainer = styled(Box)({
    position: "absolute",
    top: "-44px",
    left: "44px",
    display: "flex",
    gap: "10px",
});

const TabButton = styled(Button)(({ active }) => ({
    background: active ? "rgba(12, 14, 14, 0.9)" : "rgba(10, 10, 10, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderBottom: "none",
    color: active ? "#fff" : "#666",
    textTransform: "none",
    padding: "8px 28px",
    fontSize: "13px",
    borderRadius: "0",
    clipPath: "polygon(14px 0, 100% 0, 100% 100%, 0 100%)",
    "&:hover": {
        color: "#fff",
        background: "rgba(20, 20, 20, 0.95)",
    },
}));

const OrbContainer = styled(Box)({
    position: "absolute",
    top: "-55px",
    right: "-15px",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    zIndex: 10,
    border: "1px solid rgba(0,255,156,0.25)",
    boxShadow: "0 0 24px rgba(0,255,156,0.35)",
});

const Header = styled(Box)({
    padding: "28px 44px 10px",
});

const ChatArea = styled(Box)({
    flex: 1,
    overflowY: "auto",
    padding: "4px 44px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    "&::-webkit-scrollbar": { width: "5px" },
    "&::-webkit-scrollbar-thumb": {
        background: "rgba(0,255,156,0.15)",
        borderRadius: "3px",
    },
});

const MessageBubble = styled(Box)(({ isuser }) => ({
    maxWidth: "75%",
    alignSelf: isuser === "true" ? "flex-end" : "flex-start",
    padding: "12px 18px",
    borderRadius: "12px",
    background:
        isuser === "true"
            ? "rgba(0,255,156,0.08)"
            : "rgba(255,255,255,0.04)",
    border: `1px solid ${isuser === "true" ? "rgba(0,255,156,0.25)" : "rgba(255,255,255,0.07)"}`,
    color: "#e8e8e8",
    fontSize: "14px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
}));

const AIChip = styled(Button)({
    background: "#00ff9c",
    color: "#000",
    borderRadius: "20px",
    textTransform: "none",
    fontSize: "12px",
    padding: "4px 16px",
    fontWeight: 700,
    "&:hover": { background: "#00d680" },
});

const InputContainer = styled(Box)(({ isrecording }) => ({
    margin: "0 44px 30px",
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${isrecording === "true" ? "rgba(0,255,156,0.4)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    padding: "4px 8px 4px 20px",
    transition: "border-color 0.3s",
    boxShadow: isrecording === "true" ? "0 0 16px rgba(0,255,156,0.15)" : "none",
}));

const SearchInput = styled("input")({
    flex: 1,
    background: "none",
    border: "none",
    color: "#ddd",
    fontSize: "13px",
    outline: "none",
    padding: "10px 6px",
    "&::placeholder": { color: "#444" },
});

const MicButton = styled(IconButton)(({ islistening }) => ({
    background:
        islistening === "true"
            ? "rgba(0,255,156,0.15)"
            : "rgba(255,255,255,0.04)",
    border: `1px solid ${islistening === "true" ? "rgba(0,255,156,0.5)" : "rgba(255,255,255,0.08)"}`,
    color: islistening === "true" ? "#00ff9c" : "#666",
    marginLeft: "6px",
    padding: "7px",
    transition: "all 0.25s",
    animation: islistening === "true" ? "pulse 1.5s infinite" : "none",
    "@keyframes pulse": {
        "0%": { boxShadow: "0 0 0 0 rgba(0,255,156,0.4)" },
        "70%": { boxShadow: "0 0 0 8px rgba(0,255,156,0)" },
        "100%": { boxShadow: "0 0 0 0 rgba(0,255,156,0)" },
    },
    "&:hover": { color: "#00ff9c", background: "rgba(0,255,156,0.1)" },
}));

const SendButton = styled(IconButton)({
    background: "rgba(0,255,156,0.1)",
    border: "1px solid rgba(0,255,156,0.3)",
    color: "#00ff9c",
    marginLeft: "6px",
    padding: "7px",
    "&:hover": { background: "rgba(0,255,156,0.2)" },
});

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────

const AIAssistant = ({ open, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Send to backend API ──
    const handleSend = useCallback(
        async (textOverride = null) => {
            const textToSend = (textOverride || inputVal).trim();
            if (!textToSend || isLoading) return;

            setInputVal("");
            setMessages((prev) => [...prev, { text: textToSend, isUser: true }]);
            setIsLoading(true);

            try {
                const res = await fetch(`${API_BASE_URL}/chat/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: textToSend, mode: "ai" }),
                });
                const data = await res.json();
                setMessages((prev) => [
                    ...prev,
                    {
                        text: data.answer || "I'm sorry, I couldn't process that.",
                        isUser: false,
                    },
                ]);
            } catch (err) {
                console.error(err);
                setMessages((prev) => [
                    ...prev,
                    { text: "Error connecting to the backend. Is the Django server running?", isUser: false },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [inputVal, isLoading]
    );

    // ── Backend Whisper fallback (if Web Speech API not supported) ──
    const handleBackendTranscript = useCallback(
        async (audioBlob) => {
            const formData = new FormData();
            formData.append("audio_file", audioBlob, "recording.webm");
            try {
                const res = await fetch(`${API_BASE_URL}/speech-to-text/`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (data.transcript) {
                    // Auto-send the transcript
                    handleSend(data.transcript);
                }
            } catch (err) {
                console.error("Whisper transcription failed:", err);
            }
        },
        [handleSend]
    );

    // ── Pre-compute browser speech support before calling the hook ──
    const isSpeechSupported =
        typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    // ── useSpeech hook — exact same as frontend/src/hooks/useSpeech.js ──
    const {
        isListening,
        interimText,
        error: speechError,
        isProcessing,
        toggleListening,
    } = useSpeech({
        // When Web Speech API produces a final transcript → put it in the input box
        onTranscript: (text) => {
            setInputVal(text);
        },
        // Use backend Whisper only if browser Speech API is not available
        useBackend: !isSpeechSupported,
        onBackendTranscript: handleBackendTranscript,
    });

    if (!open) return null;

    return (
        <AnimatePresence>
            <Overlay
                key="ai-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <Box sx={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>

                    {/* Tabs */}
                    <TabsContainer>
                        <TabButton active="true" disableRipple>Main Menu</TabButton>
                        <TabButton disableRipple>Web Mode</TabButton>
                    </TabsContainer>

                    {/* Main Panel */}
                    <Container
                        initial={{ scale: 0.93, y: 24, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.93, y: 24, opacity: 0 }}
                        transition={{ type: "spring", damping: 26, stiffness: 280 }}
                    >
                        {/* Close button */}
                        <IconButton
                            sx={{ position: "absolute", top: 14, left: 14, color: "#555", "&:hover": { color: "#fff" } }}
                            onClick={onClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>

                        {/* Orb video (top-right cut corner) */}
                        <OrbContainer>
                            <video
                                src="/assets/orb/Welcome-state.mp4"
                                autoPlay loop muted playsInline
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </OrbContainer>

                        {/* Header */}
                        <Header>
                            <Typography sx={{ color: "#777", fontSize: "12px" }}>Hello!</Typography>
                            <Typography sx={{ color: "#00ff9c", fontSize: "20px", fontWeight: 600 }}>
                                Alexander Williams
                            </Typography>
                        </Header>

                        {/* Chat messages */}
                        <ChatArea>
                            {messages.length === 0 && (
                                <Typography sx={{ color: "#444", fontSize: "13px", mt: 4, fontStyle: "italic" }}>
                                    Assistant ready. Ask me anything, or click the mic to speak.
                                </Typography>
                            )}
                            {messages.map((msg, idx) => (
                                <MessageBubble key={idx} isuser={msg.isUser.toString()}>
                                    {msg.text}
                                </MessageBubble>
                            ))}
                            {/* Live interim transcript bubble */}
                            {isListening && interimText && (
                                <MessageBubble isuser="true" sx={{ opacity: 0.5, fontStyle: "italic" }}>
                                    🎙 {interimText}
                                </MessageBubble>
                            )}
                            {/* Thinking indicator */}
                            {(isLoading || isProcessing) && (
                                <Box display="flex" alignItems="center" gap={1} sx={{ alignSelf: "flex-start", p: 1 }}>
                                    <CircularProgress size={14} sx={{ color: "#00ff9c" }} />
                                    <Typography fontSize="12px" color="#00ff9c">
                                        {isProcessing ? "Processing audio..." : "Thinking..."}
                                    </Typography>
                                </Box>
                            )}
                            <div ref={chatEndRef} />
                        </ChatArea>

                        {/* Error / speech status */}
                        {speechError && (
                            <Typography sx={{ color: "#ff6b6b", fontSize: "11px", px: "44px", pb: 1 }}>
                                ⚠ {speechError}
                            </Typography>
                        )}
                        {isListening && !interimText && (
                            <Typography sx={{ color: "#00ff9c", fontSize: "11px", px: "44px", pb: 1 }}>
                                🎙 Listening... speak now
                            </Typography>
                        )}

                        {/* AI suggestion chips */}
                        <Box sx={{ display: "flex", gap: 1.5, px: "44px", pb: "14px", flexWrap: "wrap" }}>
                            <AIChip onClick={() => handleSend("Tell me about this portfolio's tech stack")}>
                                AI Suggestion
                            </AIChip>
                            <AIChip onClick={() => handleSend("What are your recent Python projects?")}>
                                AI Suggestion
                            </AIChip>
                            <AIChip onClick={() => handleSend("Show me e-commerce examples")}>
                                AI Suggestion
                            </AIChip>
                        </Box>

                        {/* Input bar */}
                        <InputContainer isrecording={isListening.toString()}>
                            <SearchInput
                                placeholder="Just type it. What do you want to know? Or click on mike icon and talk with my AI Assistant"
                                value={isListening ? interimText || inputVal : inputVal}
                                onChange={(e) => !isListening && setInputVal(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) handleSend();
                                }}
                            />
                            <SendButton onClick={() => handleSend()} size="small">
                                <ArrowUpwardIcon fontSize="small" />
                            </SendButton>
                            <MicButton
                                islistening={isListening.toString()}
                                onClick={toggleListening}
                                size="small"
                            >
                                <MicIcon fontSize="small" />
                            </MicButton>
                        </InputContainer>
                    </Container>
                </Box>
            </Overlay>
        </AnimatePresence>
    );
};

export default AIAssistant;
