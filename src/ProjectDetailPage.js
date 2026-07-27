import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@mui/material";
import ChatbotPanel from "./ChatbotPanel";
import { useResizableChatbot } from "./hooks/useResizableChatbot";
import ResizeHandle from "./ResizeHandle";
import { fetchCategories, fetchProjects } from "./api/chatApi";

const PRIMARY = "#00CD1F";

// These labels are intentionally independent from the backend category spelling.
// For example, the navigation says "Videos" even when the API exposes "Video".
const PORTFOLIO_TABS = [
  { label: "UI/UX", aliases: ["UI/UX"] },
  { label: "Social Media", aliases: ["Social Media"] },
  { label: "Videos", aliases: ["Videos", "Video"] },
  { label: "XR", aliases: ["XR"] },
];

const orbVideos = [
  "/assets/orb/Idle State.mp4",
  "/assets/orb/Listening State.mp4",
  "/assets/orb/Searching State.mp4",
  "/assets/orb/Speaking State.mp4",
];

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { category: urlCategory } = useParams();
  const { widthPercent, isDragging, handleMouseDown, containerRef } = useResizableChatbot(30, "project_chatbot_width_percentage_v2", 30, 50, [30, 50]);
  
  const [mainTabs, setMainTabs] = useState(() => PORTFOLIO_TABS.map((tab) => ({
    ...tab,
    category: tab.aliases[0],
  })));
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
      const availableCategories = Array.isArray(data) ? data : [];
      const tabs = PORTFOLIO_TABS.map((tab) => ({
        ...tab,
        category: availableCategories.find((category) => tab.aliases.includes(category)) || tab.aliases[0],
      }));
      setMainTabs(tabs);

      const urlCatDecoded = decodeURIComponent(urlCategory || "");
      const index = tabs.findIndex((tab) =>
        tab.label === urlCatDecoded || tab.aliases.includes(urlCatDecoded)
      );
      setMainTab(index === -1 ? 0 : index);
    }).catch((error) => {
      console.error(error);
      const urlCatDecoded = decodeURIComponent(urlCategory || "");
      const index = PORTFOLIO_TABS.findIndex((tab) =>
        tab.label === urlCatDecoded || tab.aliases.includes(urlCatDecoded)
      );
      setMainTab(index === -1 ? 0 : index);
    });
  }, [urlCategory]);

  // Load projects when mainTab changes
  useEffect(() => {
    if (mainTabs.length > 0) {
      setLoading(true);
      fetchProjects(mainTabs[mainTab].category)
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
          background: "rgba(255,255,255,0.02)",
          color: "rgba(255,255,255,0.6)",
          transition: "all 0.2s ease-in-out",
          padding: "25px"
        }}>
          <img src="/assets/icons/home.png"/>
        </Box>
        <Box sx={{ display: "flex", gap: "0px" }}>
          {mainTabs.map((tab, i) => {
            const isActive = mainTab === i;
            const CLIP = "polygon(24px 0%, calc(100% - 24px) 0%, 100% 100%, 0% 100%)";
            return (
              <Box
                key={i}
                onClick={() => navigate(`/portfolio/${encodeURIComponent(tab.label)}`)}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  padding: "1px 1px 0",
                  background: isActive
                    ? PRIMARY
                    : "linear-gradient(100deg, rgba(0,205,31,0.8), rgba(186,186,186,0.58) 20%, rgba(186,186,186,0.58) 80%, rgba(0,205,31,0.8))",
                  clipPath: CLIP,
                  zIndex: isActive ? 10 : i + 1,
                  marginLeft: i === 0 ? "0px" : "-24px",
                  transition: "all 0.2s",
                  filter: isActive ? "drop-shadow(0 -5px 14px rgba(0,205,31,0.2))" : "none",
                  "&:hover": {
                    filter: isActive ? "drop-shadow(0 -5px 14px rgba(0,205,31,0.28))" : "brightness(1.18)",
                  },
                }}
              >
                <Box sx={{
                  clipPath: CLIP,
                  background: isActive
                    ? PRIMARY
                    : "linear-gradient(105deg, rgba(33,33,33,0.96), rgba(41,41,41,0.9))",
                  px: "44px", py: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#080808" : "rgba(255,255,255,0.82)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  "&:hover": { color: isActive ? "#080808" : "#fff" }
                }}>
                  {tab.label}
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
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
            border: "0.5px solid transparent",

    background: `
      linear-gradient(50deg, #0A0A0A 0%, #1B1B1B 100%) padding-box,
      linear-gradient(
        11deg,
        #00CD1F 0%,
        #8C8C8C 6%,
        #8C8C8C 95%,
        #00CD1F 100%
      ) border-box
    `,
          
          borderRadius: "10px",
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
                border: subTab === i ? "1px solid transparent": "1px solid rgba(255,255,255,0.08)",
                background:
      subTab === i
        ? `linear-gradient(50deg, #0A0A0A 0%, #1B1B1B 100%) padding-box,
           linear-gradient(
             11deg,
             #00CD1F 0%,
             #8C8C8C 16%,
             #8C8C8C 85%,
             #00CD1F 100%
           ) border-box`
        : "rgba(255,255,255,0.02)",
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
                    <Box component="img" src="/assets/icons/AI.png" alt="Ask To AI" sx={{ cursor: "pointer" ,width:"40px"}} />
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
         <Box
  sx={{
    position: "relative",
    maxWidth: "90vw",
    maxHeight: "90vh",

    borderRadius: "10px",
    border: "1px solid transparent",

    background: `
      linear-gradient(50deg, #0A0A0A 0%, #1B1B1B 100%) padding-box,
      linear-gradient(
        11deg,
        #00CD1F 0%,
        #8C8C8C 6%,
        #8C8C8C 95%,
        #00CD1F 100%
      ) border-box
    `,

boxShadow: `
  0 0 2px rgba(0,255,133,.25),
  inset 0 0 1px rgba(255,255,255,.05)
`,

  }}
>

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
