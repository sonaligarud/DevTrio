import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@mui/material";
import ChatbotPanel from "./ChatbotPanel";
import { useResizableChatbot } from "./hooks/useResizableChatbot";
import ResizeHandle from "./ResizeHandle";
import { fetchCategories, fetchProjects } from "./api/chatApi";

const PRIMARY = "#00CD1F";

const orbVideos = [
  "/assets/orb/Idle State.mp4",
  "/assets/orb/Listening State.mp4",
  "/assets/orb/Searching State.mp4",
  "/assets/orb/Speaking State.mp4",
];

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { category: urlCategory } = useParams();
  const { widthPercent, isDragging, handleMouseDown, containerRef } = useResizableChatbot(33.3);
  
  const [mainTabs, setMainTabs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load categories and set initial mainTab based on URL
  useEffect(() => {
    fetchCategories().then(data => {
      if (data && data.length > 0) {
        setMainTabs(data);
        const urlCatDecoded = decodeURIComponent(urlCategory || "");
        let index = data.findIndex(c => c === urlCatDecoded);
        if (index === -1) index = 0;
        setMainTab(index);
      }
    }).catch(console.error);
  }, [urlCategory]);

  // Load projects when mainTab changes
  useEffect(() => {
    if (mainTabs.length > 0) {
      setLoading(true);
      fetchProjects(mainTabs[mainTab])
        .then(data => {
          setProjects(data);
          setSubTab(0);
          setSlideIndex(0);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setProjects([]);
          setLoading(false);
        });
    }
  }, [mainTab, mainTabs]);

  const activeProject = projects[subTab] || null;
  const slides = activeProject && activeProject.slides && activeProject.slides.length > 0 
      ? activeProject.slides 
      : ["/assets/images/projects/swift/1.jpg"]; // fallback

  const orb = orbVideos[mainTab % orbVideos.length];

  const next = () => setSlideIndex((p) => (p + 1) % slides.length);
  const prev = () => setSlideIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const lbNext = () => setLightboxIndex((p) => (p + 1) % slides.length);
  const lbPrev = () => setLightboxIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const openLightbox = () => { setLightboxIndex(slideIndex); setLightboxOpen(true); };

  return (
    <Box sx={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12)), url('/assets/images/bg-images/bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      display: "flex", flexDirection: "column",
      boxSizing: "border-box",
      p: "12.5vh 10.5vw",
      color: "#fff",
    }}>
      {/* MAIN TABS */}
      <Box sx={{ display: "flex", width: "100%", pr: `${widthPercent}%`, alignItems: "center", justifyContent: "flex-start", gap: "12px", mb: "0px", flexShrink: 0, position: "relative", zIndex: 2 }}>
        {/* Back Button */}
        <Box onClick={() => navigate("/")} sx={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32,
          cursor: "pointer",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
          color: "rgba(255,255,255,0.6)",
          transition: "all 0.2s ease-in-out",
          padding: "25px",
          "&:hover": {
            border: `1px solid ${PRIMARY}`,
            background: "rgba(0,205,31,0.08)",
            color: PRIMARY,
            boxShadow: "0 0 10px rgba(0,205,31,0.3)",
            transform: "scale(1.05)"
          }
        }}>
          <img src="/assets/icons/home.png"/>
        </Box>
        <Box sx={{ display: "flex", gap: "0px" }}>
          {mainTabs.map((tab, i) => {
            const isActive = mainTab === i;
            // trapezoid: narrower at top, wider at bottom — sides flare outward
            const CLIP = "polygon(18px 0%, calc(100% - 18px) 0%, 100% 100%, 0% 100%)";
            return (
              <Box
                key={i}
                onClick={() => { 
                  // When clicking a tab, update the URL so it's shareable and consistent
                  navigate(`/portfolio/${encodeURIComponent(tab)}`); 
                }}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  // outer wrapper = 1px border via background color
                  padding: "1px 1px 0px 1px",
                  background: isActive ? PRIMARY : "rgba(255,255,255,0.2)",
                  clipPath: CLIP,
                  // right tabs are on top (cover left tab's right edge)
                  zIndex: isActive ? 10 : i + 1,
                  marginLeft: i === 0 ? "0px" : "-18px",
                  top: isActive ? "1px" : "0px",
                  transition: "all 0.2s",
                  filter: isActive ? "drop-shadow(0px -2px 10px rgba(0,205,31,0.55))" : "none",
                  "&:hover": {
                    background: isActive ? PRIMARY : "rgba(255,255,255,0.4)",
                  },
                }}
              >
                {/* inner fill */}
                <Box sx={{
                  clipPath: CLIP,
                  background: isActive ? "rgba(10,14,10,1)" : "rgba(20,28,22,1)",
                  px: "32px", py: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? PRIMARY : "rgba(255,255,255,0.7)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  "&:hover": { color: isActive ? PRIMARY : "#fff" }
                }}>
                  {tab}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* CONTENT ROW — col 8 + col 4 */}
      <Box ref={containerRef} sx={{ display: "flex", flex: 1, gap: "0px", minHeight: 0, overflow: "visible" }}>

        {/* LEFT PANEL — col 8 */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          display: "flex", flexDirection: "column",
          background: "rgba(11, 11, 11, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderTop: `1px solid ${PRIMARY}`,
          clipPath:
            "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
          borderRadius: "16px",
          overflow: "hidden",
          minHeight: 0,
        }}>
          {/* SUB TABS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
            {!loading && projects.length === 0 && (
              <Box sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", p: 1 }}>No projects found for this category.</Box>
            )}
            {projects.map((proj, i) => (
              <Box key={i} onClick={() => { setSubTab(i); setSlideIndex(0); }} sx={{
                borderRadius: "8px", cursor: "pointer",
                padding: "10px 30px",
                fontSize: "13px", fontWeight: 500,
                color: subTab === i ? PRIMARY : "rgba(255,255,255,0.4)",
                border: subTab === i ? "1px solid rgba(0,255,150,0.5)" : "1px solid rgba(255,255,255,0.08)",
                background: subTab === i ? "rgba(0,255,150,0.08)" : "rgba(255,255,255,0.02)",
                transition: "all 0.2s",
              }}>{proj.title}</Box>
            ))}
          </Box>

          {/* SLIDER */}
          <Box sx={{ position: "relative", flex: 1, display: "flex", alignItems: "center", px: 1, minHeight: 0 }}>
            <IconButton onClick={prev} sx={{ position: "absolute", left: 8, zIndex: 2, p: 0 }}>
              <img src="/assets/icons/right.svg" alt="prev" />
            </IconButton>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", p: 1, height: "100%" }}>
              <Box sx={{ flex: "0 0 100%", position: "relative" }}>
                <img src={slides[slideIndex]} alt={`slide ${slideIndex + 1}`}
                  style={{ width: "100%", display: "block", borderRadius: "12px", objectFit: "contain" }} />
                <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", zIndex: 3 }}>
                  <Tooltip title="Ask To AI" placement="left">
                    <Box component="img" src="/assets/icons/AI.svg" alt="Ask To AI" sx={{ cursor: "pointer" }} />
                  </Tooltip>
                  <Tooltip title="Maximize" placement="left" onClick={openLightbox}>
                    <Box component="img" src="/assets/images/extend.svg" alt="Maximize" sx={{ cursor: "pointer" }} />
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            <IconButton onClick={next} sx={{ position: "absolute", right: 8, zIndex: 2, p: 0 }}>
              <img src="/assets/icons/left.svg" alt="next" />
            </IconButton>
          </Box>

          {/* DOTS */}
          <Box sx={{ display: "flex", gap: 1, py: 1.5, justifyContent: "center", flexShrink: 0 }}>
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
          position: "fixed", inset: 0, zIndex: 999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }} onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}>
          <Box sx={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <IconButton onClick={lbPrev} sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2, p: 0 }}>
              <img src="/assets/icons/right.svg" alt="prev"/>
            </IconButton>
            <Box sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}>
              <img src={slides[lightboxIndex]} alt={`slide ${lightboxIndex + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </Box>
            <IconButton onClick={lbNext} sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2, p: 0 }}>
              <img src="/assets/icons/left.svg" alt="next" />
            </IconButton>

            <Tooltip title="Minimize" placement="left">
              <Box
                component="img"
                src="/assets/icons/minimize.png"
                alt="minimize"
                onClick={() => setLightboxOpen(false)}
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  zIndex: 2,
                  cursor: "pointer",
                }}
              />
            </Tooltip>
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
