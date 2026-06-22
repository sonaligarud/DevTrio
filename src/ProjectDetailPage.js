import { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ChatbotPanel from "./ChatbotPanel";
import { useResizableChatbot } from "./hooks/useResizableChatbot";
import ResizeHandle from "./ResizeHandle";

const PRIMARY = "#00CD1F";

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

const orbVideos = [
  "/assets/orb/Idle State.mp4",
  "/assets/orb/Listening State.mp4",
  "/assets/orb/Searching State.mp4",
  "/assets/orb/Speaking State.mp4",
];

export default function ProjectDetailPage() {
  const { widthPercent, isDragging, handleMouseDown, containerRef } = useResizableChatbot(33.3);
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slides = projectSlides[subTab] || projectSlides[0];
  const orb = orbVideos[mainTab];

  const next = () => setSlideIndex((p) => (p + 1) % slides.length);
  const prev = () => setSlideIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const lbNext = () => setLightboxIndex((p) => (p + 1) % slides.length);
  const lbPrev = () => setLightboxIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const openLightbox = () => { setLightboxIndex(slideIndex); setLightboxOpen(true); };

  return (
    <Box sx={{
      width: "100vw", height: "100vh", overflow: "hidden",
      background: "radial-gradient(circle at 20% 20%, #0b1f1a, #020605 70%)",
      display: "flex", flexDirection: "column",
      px: "4vw", py: "3vh",
      color: "#fff",
    }}>
      {/* MAIN TABS */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: "16px", flexShrink: 0 }}>
        <Box sx={{ display: "flex", background: "rgba(0,0,0,0.4)", borderRadius: "12px", p: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
          {mainTabs.map((tab, i) => (
            <Box key={i} onClick={() => { setMainTab(i); setSubTab(0); setSlideIndex(0); }} sx={{
              px: 3, py: 1, borderRadius: "8px", cursor: "pointer",
              fontSize: "13px", fontWeight: 500,
              color: mainTab === i ? PRIMARY : "rgba(255,255,255,0.5)",
              background: mainTab === i ? "rgba(0,255,150,0.08)" : "transparent",
              border: mainTab === i ? "1px solid rgba(0,255,150,0.5)" : "1px solid transparent",
              transition: "all 0.2s",
              "&:hover": { color: "#fff" },
            }}>{tab}</Box>
          ))}
        </Box>
      </Box>

      {/* CONTENT ROW — col 8 + col 4 */}
      <Box ref={containerRef} sx={{ display: "flex", flex: 1, gap: "0px", minHeight: 0, overflow: "visible" }}>

        {/* LEFT PANEL — col 8 */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          display: "flex", flexDirection: "column",
          background: "rgba(10,14,10,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
          minHeight: 0,
        }}>
          {/* SUB TABS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
            <img src="/assets/icons/right.svg" alt="back" />
            {subTabs.map((tab, i) => (
              <Box key={i} onClick={() => { setSubTab(i); setSlideIndex(0); }} sx={{
                px: 2, py: 0.6, borderRadius: "8px", cursor: "pointer",
                fontSize: "12px", fontWeight: 500,
                color: subTab === i ? PRIMARY : "rgba(255,255,255,0.4)",
                border: subTab === i ? "1px solid rgba(0,255,150,0.5)" : "1px solid rgba(255,255,255,0.08)",
                background: subTab === i ? "rgba(0,255,150,0.08)" : "rgba(255,255,255,0.02)",
                transition: "all 0.2s",
              }}>{tab}</Box>
            ))}
          </Box>

          {/* SLIDER */}
          <Box sx={{ position: "relative", flex: 1, display: "flex", alignItems: "center", px: 1, minHeight: 0 }}>
            <IconButton onClick={prev} sx={{ position: "absolute", left: 8, zIndex: 2, p: 0 }}>
              <img src="/assets/icons/right.svg" alt="prev" />
            </IconButton>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", px: "52px", height: "100%" }}>
              <Box sx={{ flex: "0 0 100%", position: "relative" }}>
                <img src={slides[slideIndex]} alt={`slide ${slideIndex + 1}`}
                  style={{ width: "100%", display: "block", borderRadius: "12px", maxHeight: "55vh", objectFit: "contain" }} />
                <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", gap: 1, zIndex: 3 }}>
                  {/* <Tooltip title="Share" placement="left">
                    <IconButton sx={{
                      width: 32, height: 32, borderRadius: "8px",
                      background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", color: "#aaa",
                      "&:hover": { border: "1px solid rgba(0,255,150,0.4)", color: PRIMARY },
                    }}>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip> */}
                  <Tooltip title="Fullscreen" placement="left">
                    <IconButton onClick={openLightbox} sx={{
                      width: 32, height: 32, borderRadius: "8px",
                      background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)",
                      "&:hover": { border: "1px solid rgba(0,255,150,0.4)" },
                    }}>
                      <Box component="img" src="/assets/images/extend.svg" alt="fullscreen" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            <IconButton onClick={next} sx={{ position: "absolute", right: 8, zIndex: 2, p: 0 }}>
              <img src="/assets/icons/left.svg" alt="next" />
            </IconButton>
          </Box>

          {/* DOTS */}
          <Box sx={{ display: "flex", gap: 1, py: 1.5, pl: 2, flexShrink: 0 }}>
            {slides.map((_, i) => (
              <Box key={i} onClick={() => setSlideIndex(i)} sx={{
                width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                transition: "all 0.3s",
                background: i === slideIndex ? PRIMARY : "transparent",
                border: i === slideIndex ? `2px solid ${PRIMARY}` : "2px solid #555",
              }} />
            ))}
          </Box>
        </Box>

        {/* Resize Handle */}
        <ResizeHandle onMouseDown={handleMouseDown} isDragging={isDragging} />

        {/* RIGHT PANEL — col 4 */}
        <ChatbotPanel
          orb={orb}
          chips={["View Case Study", "About Akash"]}
          wrapperSx={{ width: `${widthPercent}%`, flexShrink: 0, minWidth: 0, height: "100%" }}
        />
      </Box>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.92)",
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }} onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}>
          <Box sx={{ position: "relative", maxWidth: "80vw", maxHeight: "80vh" }}>
            <IconButton onClick={lbPrev} sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2, p: 0 }}>
              <img src="/assets/icons/left.svg" alt="prev" style={{ width: 36, height: 36 }} />
            </IconButton>
            <Box sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}>
              <img src={slides[lightboxIndex]} alt={`slide ${lightboxIndex + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </Box>
            <IconButton onClick={lbNext} sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2, p: 0 }}>
              <img src="/assets/icons/right.svg" alt="next"/>
            </IconButton>
            <IconButton onClick={() => setLightboxOpen(false)} sx={{
              position: "absolute", bottom: 10, right: 10, zIndex: 2,
              width: 32, height: 32, borderRadius: "8px",
              background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)",
              "&:hover": { border: "1px solid rgba(0,255,150,0.4)" },
            }}>
              <Box component="img" src="/assets/images/extend.svg" alt="minimize" sx={{ width: 15, height: 15 }} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {slides.map((_, i) => (
              <Box key={i} onClick={() => setLightboxIndex(i)} sx={{
                width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                background: i === lightboxIndex ? PRIMARY : "transparent",
                border: i === lightboxIndex ? `2px solid ${PRIMARY}` : "2px solid #555",
              }} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
