import { useState } from "react";
import { Box, Tabs, Tab, IconButton, TextField, InputAdornment, Button } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MicIcon from "@mui/icons-material/Mic";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

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

export default function ProjectDetailPage() {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = projectSlides[subTab];
  const next = () => setSlideIndex((p) => (p + 1) % slides.length);
  const prev = () => setSlideIndex((p) => (p === 0 ? slides.length - 1 : p - 1));

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
          onChange={(_, v) => setMainTab(v)}
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
      <Box sx={{ flex: 1, display: "flex", gap: 2 }}>

        {/* LEFT PANEL */}
        <Box sx={{ flex: "0 0 75%", maxWidth: "75%", display: "flex", flexDirection: "column" }}>

          {/* HUD background */}
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
                <img src="/assets/icons/right.svg" alt="prev" />
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

              {/* LEFT ARROW */}
              <IconButton onClick={prev} sx={{
                position: "absolute", left: 8, zIndex: 2,
                p: 0, border: "none",
              }}>
                <img src="/assets/icons/right.svg" alt="prev" />
              </IconButton>

              {/* SLIDE CONTENT */}
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", padding: "0px 65px"}}>
                <Box>
                  <img
                    src={slides[slideIndex]}
                    alt={`slide ${slideIndex + 1}`}
                    style={{ width: "100%", display: "block", borderRadius: "12px" }}
                  />
                </Box>
              </Box>

              {/* RIGHT ARROW */}
              <IconButton onClick={next} sx={{
                position: "absolute", right: 8, zIndex: 2,
                p: 0, border: "none",
              }}>
                <img src="/assets/icons/left.svg" alt="next" />
              </IconButton>

            </Box>
          </Box>

          {/* DOTS - below HUD frame */}
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

        {/* RIGHT PANEL - Chatbot */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{
            flex: 1,
            borderRadius: "24px",
            border: "1px solid rgba(0,255,150,0.2)",
            background: "linear-gradient(180deg, rgba(10,25,20,0.95), rgba(2,8,5,0.98))",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>

            {/* CHAT MESSAGES */}
            <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
              <Box sx={{
                background: "rgba(255,255,255,0.06)", borderRadius: "12px",
                p: 2, fontSize: "0.85rem", color: "#ccc", lineHeight: 1.6,
              }}>
                Hi!<br />
                I'm <strong style={{ color: "#fff" }}>Nova</strong>, Akash's AI Assistant.<br />
                I can walk you through projects, thinking, and decisions.<br />
                Where should we start?
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{
                  background: "rgba(255,255,255,0.06)", borderRadius: "12px",
                  p: 1.5, fontSize: "0.85rem", color: "#ccc", maxWidth: "80%",
                }}>
                  Hi!<br />Competitor
                </Box>
              </Box>
            </Box>

            {/* ACTION BUTTONS */}
            <Box sx={{ px: 2, pb: 1, display: "flex", gap: 1 }}>
              <Button size="small" sx={{
                flex: 1, borderRadius: "20px", textTransform: "none",
                border: "1px solid rgba(255,255,255,0.15)", color: "#ccc", fontSize: "0.75rem", py: 0.8,
              }}>View Case Study</Button>
              <Button size="small" sx={{
                flex: 1, borderRadius: "20px", textTransform: "none",
                border: "1px solid rgba(255,255,255,0.15)", color: "#ccc", fontSize: "0.75rem", py: 0.8,
              }}>About Akash</Button>
            </Box>

            {/* INPUT */}
            <Box sx={{ px: 2, pb: 2 }}>
              <TextField
                fullWidth placeholder="Ask anything" variant="outlined" size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: "#fff",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(0,255,150,0.3)" },
                  },
                  "& input::placeholder": { color: "#555" },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" sx={{ color: "#555" }}>
                          <MicIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "#555" }}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

          </Box>
        </Box>

      </Box>
    </Box>
  );
}
