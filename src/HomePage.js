import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AboutMe from "./AboutMe";
import ScrollAnimation from "./ScrollAnimation";
import AIAssistant from "./AIAssistant";

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

const AboutButton = styled(Button)({
  border: "1px solid #00ff9c",
  color: "#00ff9c",
  borderRadius: "6px",
  padding: "5px 18px",
  textTransform: "none",
  fontSize: "13px",
  "&:hover": {
    background: "#00ff9c",
    color: "#000",
  },
});

const LandingPage = () => {
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div style={{ background: "#000" }}>
      {assistantOpen && (
        <AIAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      )}
      <AboutMe open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* Scroll-driven animation — UI overlaid inside the sticky viewport */}
      <ScrollAnimation>

        {/* ── DESKTOP: buttons and card at the bottom of the animation ── */}
        <Box sx={{
          display: { xs: "none", md: "flex" },
          position: "absolute",
          inset: 0,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          pb: "60px",
          pointerEvents: "none",
        }}>
          <Typography sx={{
            color: "#cfcfcf", fontSize: "15px", fontWeight: 400,
            mb: 1.5, letterSpacing: "0.5px",
          }}>
            Welcome to the Portfolio
          </Typography>

          {/* Card with buttons + orb */}
          <Box sx={{ position: "relative", width: "700px", display: "flex", alignItems: "center" }}>
            <Box sx={{
              flex: 1, height: "155px",
              backgroundImage: "url('/assets/images/vector_2026-03-26/vector@3x.png')",
              backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "24px", px: "40px",
            }}>
              <Button
                onClick={() => setAssistantOpen(true)}
                sx={{
                  padding: "11px 36px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)", color: "#bbb",
                  textTransform: "none", fontSize: "13px",
                  background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                  whiteSpace: "nowrap", pointerEvents: "auto",
                  "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" },
                }}
              >
                Talk with my AI Assistant
              </Button>
              <Button
                onClick={() => navigate("/portfolio")}
                sx={{
                  padding: "11px 36px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)", color: "#bbb",
                  textTransform: "none", fontSize: "13px",
                  background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                  whiteSpace: "nowrap", pointerEvents: "auto",
                  "&:hover": { border: "1px solid #00ff9c", color: "#00ff9c" },
                }}
              >
                Jump on Web Mode
              </Button>
            </Box>

            {/* Orb video */}
            <Box sx={{
              position: "absolute", right: "-110px", top: "50%",
              transform: "translateY(-50%)", width: "160px", height: "160px",
              borderRadius: "50%", overflow: "hidden", zIndex: 2,
            }}>
              <video
                src="/assets/orb/Welcome-state.mp4"
                autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Desktop — About Me button top-right */}
        <Box sx={{
          display: { xs: "none", md: "block" },
          position: "absolute", top: 24, right: 40,
          pointerEvents: "auto", zIndex: 10,
        }}>
          <AboutButton onClick={() => setAboutOpen(true)}>About Me</AboutButton>
        </Box>

        {/* Desktop — name + title at very bottom */}
        <Box sx={{
          display: { xs: "none", md: "block" },
          position: "absolute", bottom: 16, left: 0, right: 0,
          textAlign: "center", pointerEvents: "none",
        }}>
          <Typography sx={{ color: "#00ff9c", letterSpacing: "5px", fontSize: "20px", fontWeight: 500 }}>
            AKASH PARDESHI
          </Typography>
          <Typography sx={{ color: "#555", fontSize: "9px", letterSpacing: "7px", mt: 0.8 }}>
            UI DESIGNER &amp; UX RESEARCHER
          </Typography>
        </Box>

        {/* ── MOBILE: centered card over animation ── */}
        <Box sx={{
          display: { xs: "flex", md: "none" },
          position: "absolute", inset: 0,
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          px: 3, pointerEvents: "none",
        }}>
          <Box sx={{
            width: "100%", maxWidth: "360px",
            backgroundImage: "url('/assets/images/hud/Main_Landing_Page_Mobile.svg')",
            backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
            position: "relative", px: 3, pt: 3, pb: 4,
            display: "flex", flexDirection: "column", gap: 2,
            pointerEvents: "auto",
          }}>
            {/* Orb */}
            <Box sx={{
              position: "absolute", top: "-40px", right: "-28px",
              width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", zIndex: 2,
            }}>
              <video
                src="/assets/orb/Welcome-state.mp4"
                autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography sx={{ color: "#aaa", fontSize: "12px" }}>Welcome to the</Typography>
              <Typography sx={{ color: "#fff", fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>Portfolio</Typography>
            </Box>

            <Box sx={{ my: 1 }}>
              <Typography sx={{ color: "#00ff9c", letterSpacing: "3px", fontSize: "16px", fontWeight: 600 }}>
                AKASH PARDESHI
              </Typography>
              <Typography sx={{ color: "#555", fontSize: "8px", letterSpacing: "4px", mt: 0.5 }}>
                UI DESIGNER &amp; UX RESEARCHER
              </Typography>
            </Box>

            <GlassButton onClick={() => setAssistantOpen(true)}>
              Talk with my AI Assistant
            </GlassButton>
            <GlassButton onClick={() => navigate("/portfolio")}>
              Jump on Web Mode
            </GlassButton>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <AboutButton onClick={() => setAboutOpen(true)}>About Me</AboutButton>
            </Box>
          </Box>
        </Box>

      </ScrollAnimation>
    </div>
  );
};

export default LandingPage;
