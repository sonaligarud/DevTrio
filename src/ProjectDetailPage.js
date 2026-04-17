import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useNavigate } from "react-router-dom";
import ChatbotPanel from "./ChatbotPanel";

const PRIMARY = "#00ff9c";

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
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [leftPct, setLeftPct] = useState(72);
  const [scale, setScale] = useState(1);

  const containerRef = useRef(null);
  const dragging = useRef(false);

  const slides = projectSlides[subTab] || projectSlides[0];
  const orb = orbVideos[mainTab];

  const next = () => setSlideIndex((p) => (p + 1) % slides.length);
  const prev = () => setSlideIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const lbNext = () => setLightboxIndex((p) => (p + 1) % slides.length);
  const lbPrev = () => setLightboxIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const openLightbox = () => { setLightboxIndex(slideIndex); setLightboxOpen(true); };

  useEffect(() => {
    const updateScale = () => {
      const s = Math.min(window.innerWidth / 1440, window.innerHeight / 820);
      setScale(Math.min(s, 1));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const onMouseDown = (e) => { dragging.current = true; e.preventDefault(); };
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setLeftPct(Math.min(85, Math.max(45, (x / rect.width) * 100)));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <Box sx={{
      width: "100vw", height: "100vh", overflow: "hidden",
      background: "radial-gradient(circle at 20% 20%, #0b1f1a, #020605 70%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "#fff",
    }}>
      <Box sx={{
        display: "flex", flexDirection: "column",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        width: "1400px",
      }}>
        {/* MAIN TABS */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
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

        {/* CONTENT ROW */}
        <Box ref={containerRef} sx={{ display: "flex", height: "78vh", position: "relative", overflow: "visible" }}>

          {/* LEFT PANEL */}
          <Box sx={{ width: `${leftPct}%`, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <Box sx={{
              flex: 1,
              backgroundImage: "url('/assets/images/hud/portfolio-page.svg')",
              backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat",
              borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
              {/* SUB TABS */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2, pb: 1 }}>
               
                  <img src="/assets/icons/right.svg" alt="back"/>
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
              <Box sx={{ position: "relative", flex: 1, display: "flex", alignItems: "center", px: 1 }}>
                <IconButton onClick={prev} sx={{ position: "absolute", left: 8, zIndex: 2, p: 0 }}>
                  <img src="/assets/icons/right.svg" alt="prev"/>
                </IconButton>
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 4, px: "52px" }}>
                  <Box sx={{ flex: "0 0 100%", position: "relative" }}>
                    <img src={slides[slideIndex]} alt={`slide ${slideIndex + 1}`}
                      style={{ width: "100%", display: "block", borderRadius: "12px" }} />
                    <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", gap: 1, zIndex: 3 }}>
                      <Tooltip title="Share" placement="left">
                        <IconButton sx={{
                          width: 32, height: 32, borderRadius: "8px",
                          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", color: "#aaa",
                          "&:hover": { border: "1px solid rgba(0,255,150,0.4)", color: PRIMARY },
                        }}>
                          <ShareIcon/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Fullscreen" placement="left">
                        <IconButton onClick={openLightbox} sx={{
                          width: 32, height: 32, borderRadius: "8px",
                          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)",
                          "&:hover": { border: "1px solid rgba(0,255,150,0.4)" },
                        }}>
                          <Box component="img" src="/assets/images/extend.svg" alt="fullscreen"/>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={next} sx={{ position: "absolute", right: 8, zIndex: 2, p: 0 }}>
                  <img src="/assets/icons/left.svg" alt="next"/>
                </IconButton>
              </Box>
            </Box>

            {/* DOTS */}
            <Box sx={{ display: "flex", gap: 1, pt: 1.5, pl: 1 }}>
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

          {/* DRAGGABLE DIVIDER */}
          <Box onMouseDown={onMouseDown} onTouchStart={onMouseDown} sx={{
            width: "18px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "col-resize", zIndex: 2,
            "&:hover .drag-handle": { background: "rgba(0,255,150,0.6)" },
          }}>
            <Box className="drag-handle" sx={{ width: 4, height: 40, borderRadius: 2, background: "rgba(255,255,255,0.2)", transition: "background 0.2s" }} />
          </Box>

          {/* RIGHT PANEL — shared ChatbotPanel */}
          <ChatbotPanel
            orb={orb}
            chips={["View Case Study", "About Akash"]}
            wrapperSx={{ flex: 1, minWidth: 0, height: "100%" }}
          />
        </Box>
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
