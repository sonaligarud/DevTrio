import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VideoFlow from "./VideoFlow";

const PageWrapper = styled(Box)({
  height: "100vh",
  width: "100%",
  backgroundColor: "transparent",
  position: "relative",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const GlassButton = styled(Button)({
  width: "100%",
  padding: "12px 0",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#bbb",
  textTransform: "none",
  fontSize: "13px",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
  "&:hover": {
    border: "1px solid #00ff9c",
    color: "#00ff9c",
    boxShadow: "0 0 14px rgba(0,255,150,0.4)",
  },
});

const LandingPage = () => {
  const navigate = useNavigate();
  const alreadySeen = sessionStorage.getItem("introSeen") === "true";
  const [introComplete, setIntroComplete] = useState(alreadySeen);
  const introCompleteRef = useRef(alreadySeen);
  const reverseCalledRef = useRef(false);

  const handleIntroComplete = () => {
    sessionStorage.setItem("introSeen", "true");
    introCompleteRef.current = true;
    reverseCalledRef.current = false;
    setIntroComplete(true);
  };

  const handleReverseComplete = () => {
    sessionStorage.removeItem("introSeen");
    introCompleteRef.current = false;
    setIntroComplete(false);
  };

  // Wheel handler lives here — direct access to ref, no stale closure
  useEffect(() => {
    const onWheel = (e) => {
      if (e.deltaY < 0 && introCompleteRef.current && !reverseCalledRef.current) {
        reverseCalledRef.current = true;
        handleReverseComplete();
        // tell VideoFlow to start scrubbing backward
        if (window.__videoFlowOnReverseScroll) window.__videoFlowOnReverseScroll();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <VideoFlow
        onComplete={handleIntroComplete}
        skipIntro={alreadySeen}
        introComplete={introComplete}
      />
      <div style={{
        opacity: introComplete ? 1 : 0,
        transition: "opacity 1s ease",
        pointerEvents: introComplete ? "auto" : "none",
        position: "fixed",
        inset: 0,
        zIndex: 1,
        backgroundImage: "url('/assets/images/final-sequence/High/Final_00227.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <PageWrapper>

          {/* ── DESKTOP layout ── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ position: "relative", width: "700px", display: "flex", alignItems: "center" }}>
              {/* Card */}
              <Box
                sx={{
                  flex: 1,
                  height: "260px",
                  backgroundImage: "url('/assets/images/vector_2026-03-26/vector@3x.png')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  px: "40px",
                }}
              >

                <Typography sx={{ color: "#cfcfcf", fontSize: "18px", fontWeight: 400, mb: 1.5, letterSpacing: "0.5px" }}>
                  Welcome to the Portfolio
                </Typography>
                <Button
                  sx={{
                    width: "70%", padding: "11px 36px", borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)", color: "#bbb",
                    textTransform: "none", fontSize: "13px",
                    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                    whiteSpace: "nowrap",
                    "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" },
                  }}
                >
                  Talk with my AI Assistant
                </Button>
                <Button
                  onClick={() => navigate('/portfolio')}
                  sx={{
                    width: "70%", padding: "11px 36px", borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)", color: "#bbb",
                    textTransform: "none", fontSize: "13px",
                    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                    whiteSpace: "nowrap",
                    "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" },
                  }}
                >
                  Jump on Web Mode
                </Button>
              </Box>

              {/* Orb */}
              <Box sx={{ position: "absolute", right: "-110px", top: "50%", transform: "translateY(-50%)", width: "160px", height: "160px", borderRadius: "50%", overflow: "hidden", zIndex: 2 }}>
                <video src="/assets/orb/Welcome-state.mp4" autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            </Box>

            {/* Desktop bottom name */}
            <Box position="absolute" bottom={36} textAlign="center">
              <Typography sx={{ color: "#00ff9c", letterSpacing: "5px", fontSize: "20px", fontWeight: 500 }}>
                AKASH PARDESHI
              </Typography>
              <Typography sx={{ color: "#555", fontSize: "9px", letterSpacing: "7px", mt: 0.8 }}>
                UI DESIGNER &amp; UX RESEARCHER
              </Typography>
            </Box>
          </Box>

          {/* ── MOBILE layout ── */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              px: 3,
            }}
          >
            {/* Mobile card — using mobile HUD SVG as background */}
            <Box
              sx={{
                width: "100%",
                maxWidth: "360px",
                backgroundImage: "url('/assets/images/hud/Main_Landing_Page_Mobile.svg')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                position: "relative",
                px: 3,
                pt: 3,
                pb: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Orb — top right cut corner of mobile HUD */}
              <Box
                sx={{
                  position: "absolute",
                  top: "-40px",
                  right: "-28px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  zIndex: 2,
                }}
              >
                <video
                  src="/assets/orb/Welcome-state.mp4"
                  autoPlay loop muted playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>

              {/* Welcome text */}
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ color: "#aaa", fontSize: "12px", fontWeight: 400 }}>
                  Welcome to the
                </Typography>
                <Typography sx={{ color: "#fff", fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>
                  Portfolio
                </Typography>
              </Box>

              {/* Name & title */}
              <Box sx={{ my: 1 }}>
                <Typography sx={{ color: "#00ff9c", letterSpacing: "3px", fontSize: "16px", fontWeight: 600 }}>
                  AKASH PARDESHI
                </Typography>
                <Typography sx={{ color: "#555", fontSize: "8px", letterSpacing: "4px", mt: 0.5 }}>
                  UI DESIGNER &amp; UX RESEARCHER
                </Typography>
              </Box>

              {/* Buttons stacked */}
              <GlassButton>Talk with my AI Assistant</GlassButton>
              <GlassButton onClick={() => navigate('/portfolio')}>Jump on Web Mode</GlassButton>
            </Box>
          </Box>
        </PageWrapper>
      </div>
    </>
  );
};

export default LandingPage;
