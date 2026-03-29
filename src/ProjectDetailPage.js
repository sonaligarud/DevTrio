import { Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled(Box)({
  height: "100vh",
  width: "100%",
  backgroundImage: "url('/assets/images/bg-images/Background.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#05070a",
  position: "relative",
  overflow: "hidden",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
});


// Breadcrumb shaped like a pointed arrow chip (Main Menu)
const MainMenuChip = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "7px 20px 7px 14px",
  background: "rgba(30,34,40,0.95)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "8px 0 0 8px",
  fontSize: "13px",
  color: "#fff",
  cursor: "pointer",
  position: "relative",
  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
  paddingRight: "28px",
  "&:hover": { background: "rgba(50,55,62,0.95)" },
});

const CategoryChip = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "7px 20px 7px 22px",
  borderLeft: "none",
  borderRadius: "0 8px 8px 0",
  fontSize: "13px",
  color: "#aaa",
  whiteSpace: "nowrap",
});

const ProjectTab = styled(Box)(({ active }) => ({
  padding: "6px 20px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: active ? 600 : 400,
  color: active ? "#00cd1f" : "#888",
  background: active ? "rgba(184,255,110,0.08)" : "transparent",
  border: active ? "1px solid #00cd1f" : "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.2s ease",
  "&:hover": { border: "1px solid rgba(184,255,110,0.3)", color: "#ccc" },
}));

const SliderDot = styled(Box)(({ active }) => ({
  width: active ? "15px" : "15px",
  height: active ? "15px" : "15px",
  borderRadius: "50%",
  background: active ? "#00cd1f" : "rgba(255,255,255,0.25)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: active ? "0 0 8px #00cd1f" : "none",
}));

const NavArrowBtn = styled(IconButton)({
  width: "36px",
  height: "36px",
  background: "rgba(0,0,0,0.55)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  borderRadius: "6px",
  "&:hover": { background: "rgba(255,255,255,0.1)" },
});

// ─── Mock Data ────────────────────────────────────────────────────────────────

const projectData = {
  "UI/UX": [
    {
      id: 1,
      label: "UI/UX",
      name: "Project Name Here",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      stats: [
        { icon: "📊", label: "Traffic", value: "50,000 + 250,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "4,000 Tickets", sub: "supporting request As during tasks." },
        { icon: "📊", label: "Traffic", value: "50,000 + 250,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "4,000 Tickets", sub: "supporting request As during tasks." },
      ],
      slides: [
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
      ],
    },
    {
      id: 2,
      label: "UI/UX",
      name: "Project Name Here",
      description: "Dashboard redesign for analytics platform with improved data visualization.",
      stats: [
        { icon: "📊", label: "Traffic", value: "30,000 + 100,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "2,500 Tickets", sub: "supporting request As during tasks." },
        { icon: "📊", label: "Traffic", value: "30,000 + 100,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "2,500 Tickets", sub: "supporting request As during tasks." },
      ],
      slides: [
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
      ],
    },
    {
      id: 3,
      label: "UI/UX",
      name: "Project Name Here",
      description: "E-commerce mobile application design with seamless checkout flow.",
      stats: [
        { icon: "📊", label: "Traffic", value: "20,000 + 80,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "1,800 Tickets", sub: "supporting request As during tasks." },
        { icon: "📊", label: "Traffic", value: "20,000 + 80,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "1,800 Tickets", sub: "supporting request As during tasks." },
      ],
      slides: [
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
      ],
    },
    {
      id: 4,
      label: "UI/UX",
      name: "Project Name Here",
      description: "Onboarding flow redesign for SaaS product improving user activation.",
      stats: [
        { icon: "📊", label: "Traffic", value: "15,000 + 60,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "1,200 Tickets", sub: "supporting request As during tasks." },
        { icon: "📊", label: "Traffic", value: "15,000 + 60,000", sub: "Million ACTIVE range in daily visitors." },
        { icon: "🎫", label: "Returns", value: "1,200 Tickets", sub: "supporting request As during tasks." },
      ],
      slides: [
        "/assets/images/group.png",
        "/assets/images/group.png",
        "/assets/images/group.png",
      ],
    },
  ],
  "Social Media": [
    {
      id: 1, label: "Social Media", name: "Project Name Here",
      description: "Instagram campaign for product launch.",
      stats: [
        { icon: "📊", label: "Traffic", value: "50,000+", sub: "Impressions" },
        { icon: "🎫", label: "Engagement", value: "8,000", sub: "interactions" },
        { icon: "📊", label: "Traffic", value: "50,000+", sub: "Impressions" },
        { icon: "🎫", label: "Engagement", value: "8,000", sub: "interactions" },
      ],
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "Print-Designs": [
    {
      id: 1, label: "Print", name: "Project Name Here",
      description: "Complete brand identity package.",
      stats: [
        { icon: "📊", label: "Deliverables", value: "24 Assets", sub: "print-ready files" },
        { icon: "🎫", label: "Formats", value: "6 Types", sub: "across media" },
        { icon: "📊", label: "Deliverables", value: "24 Assets", sub: "print-ready files" },
        { icon: "🎫", label: "Formats", value: "6 Types", sub: "across media" },
      ],
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "Video": [
    {
      id: 1, label: "Video", name: "Project Name Here",
      description: "Animated explainer video for product demo.",
      stats: [
        { icon: "📊", label: "Duration", value: "2:30 min", sub: "final cut" },
        { icon: "🎫", label: "Views", value: "12,000+", sub: "in first week" },
        { icon: "📊", label: "Duration", value: "2:30 min", sub: "final cut" },
        { icon: "🎫", label: "Views", value: "12,000+", sub: "in first week" },
      ],
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
  "XR": [
    {
      id: 1, label: "XR", name: "Project Name Here",
      description: "Immersive virtual reality environment design.",
      stats: [
        { icon: "📊", label: "Scenes", value: "8 Environments", sub: "interactive" },
        { icon: "🎫", label: "Users", value: "500+", sub: "beta testers" },
        { icon: "📊", label: "Scenes", value: "8 Environments", sub: "interactive" },
        { icon: "🎫", label: "Users", value: "500+", sub: "beta testers" },
      ],
      slides: ["/assets/images/group.png", "/assets/images/group.png"],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProjectDetailPage = () => {
  const { category: rawCategory } = useParams();
  const category = decodeURIComponent(rawCategory || '');
  const navigate = useNavigate();
  const projects = projectData[category] || [];
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const currentProject = projects[currentProjectIndex] || {};
  const slides = currentProject.slides || [];
  const totalSlides = slides.length;

  const prevSlide = () => setCurrentSlide((s) => (s - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % totalSlides);

  const handleProjectChange = (i) => {
    setCurrentProjectIndex(i);
    setCurrentSlide(0);
  };

  return (
    <PageWrapper>
      {/* ══════════════ DESKTOP ══════════════ */}
      <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", height: "100%", p: "24px 28px" }}>

        {/* Breadcrumb row */}
        <Box sx={{ display: "flex", alignItems: "stretch", mb: 2.5 }}>
          <MainMenuChip onClick={() => navigate('/portfolio')}>
            Main Menu
          </MainMenuChip>
          <CategoryChip>
            Main Category /&nbsp;
            <Box component="span" sx={{ color: "#b8ff6e", fontWeight: 500 }}>
              {category} Project
            </Box>
          </CategoryChip>
        </Box>

        {/* Main card */}
        <Box
          sx={{
            flex: 1,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(28px)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: "20px 24px 16px",
          }}
        >
          {/* Green glow dot bottom-left */}
          <Box sx={{
            position: "absolute", bottom: 18, left: 22,
            width: 10, height: 10, borderRadius: "50%",
            background: "#b8ff6e", boxShadow: "0 0 18px 5px rgba(184,255,110,0.55)",
            zIndex: 2,
          }} />

          {/* Green orb right edge */}
          <Box sx={{
            position: "absolute", right: "-38px", top: "50%",
            transform: "translateY(-50%)",
            width: "110px", height: "110px",
            borderRadius: "50%", overflow: "hidden",
            opacity: 0.95, zIndex: 3,
          }}>
            <video src="/assets/orb/Idle State.mp4" autoPlay loop muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Box>

          {/* Project tabs row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            {/* Back arrow */}
            <Box
              onClick={() => navigate('/portfolio')}
              sx={{
                width: 30, height: 30, borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", flexShrink: 0,
                "&:hover": { background: "rgba(255,255,255,0.08)" },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 13 }} />
            </Box>

            {projects.map((proj, i) => (
              <ProjectTab
                key={proj.id}
                active={i === currentProjectIndex ? 1 : 0}
                onClick={() => handleProjectChange(i)}
              >
                Project -{i + 1}
              </ProjectTab>
            ))}
          </Box>

          {/* Content row: left sidebar + image viewer */}
          <Box sx={{ flex: 1, display: "flex", gap: 3, minHeight: 0 }}>

            {/* Left sidebar */}
            <Box sx={{ width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5, textAlign: "left", justifyContent: "center", alignItems: "center" }}>
              <Typography sx={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                {currentProject.label}
              </Typography>
              <Typography sx={{ color: "#fff", fontSize: "20px", fontWeight: 700, lineHeight: 1.25 }}>
                {currentProject.name}
              </Typography>
              <Typography sx={{ fontSize: "11px", lineHeight: 1.65 }}>
                {currentProject.description}
              </Typography>

              {/* Stats grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
                {(currentProject.stats || []).map((stat, i) => (
                  <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                    <Box sx={{ fontSize: "16px" }}>{stat.icon}</Box>
                    <Typography sx={{ color: "#888", fontSize: "10px" }}>{stat.label}</Typography>
                    <Typography sx={{ color: "#fff", fontSize: "11px", fontWeight: 700, lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", lineHeight: 1.4 }}>
                      {stat.sub}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Image viewer */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", minHeight: 0 }}>

                {/* Left nav arrow */}
                <NavArrowBtn onClick={prevSlide} sx={{ position: "absolute", left: -18, zIndex: 2 }}>
                  <ChevronLeftIcon sx={{ fontSize: 20 }} />
                </NavArrowBtn>

                {/* Image frame */}
                <Box sx={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  mx: "20px",
                }}>
                  <Box
                    component="img"
                    src={slides[currentSlide]}
                    alt={`slide-${currentSlide}`}
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                  {/* Expand icon */}
                  <Box sx={{
                    position: "absolute", bottom: 10, right: 10,
                    width: 28, height: 28, borderRadius: "6px",
                    background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <OpenInFullIcon sx={{ fontSize: 14, color: "#fff" }} />
                  </Box>
                </Box>

                {/* Right nav arrow */}
                <NavArrowBtn onClick={nextSlide} sx={{ position: "absolute", right: -18, zIndex: 2 }}>
                  <ChevronRightIcon sx={{ fontSize: 20 }} />
                </NavArrowBtn>
              </Box>

              {/* Dot pagination */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8, mt: 1.5 }}>
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════ MOBILE ══════════════ */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", height: "100%", px: 2, pt: 2.5, pb: 2 }}>

        {/* Breadcrumb */}
        <Box sx={{ display: "flex", alignItems: "stretch", mb: 2 }}>
          <MainMenuChip onClick={() => navigate('/portfolio')} sx={{ fontSize: "11px", padding: "6px 24px 6px 12px" }}>
            Main Menu
          </MainMenuChip>
          <CategoryChip sx={{ fontSize: "11px", padding: "6px 14px 6px 18px" }}>
            {category}&nbsp;<Box component="span" sx={{ color: "#b8ff6e" }}>Project</Box>
          </CategoryChip>
        </Box>

        {/* Card */}
        <Box sx={{
          flex: 1, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)",
          display: "flex", flexDirection: "column", p: 2, overflow: "hidden", position: "relative",
        }}>
          {/* Project tabs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, overflowX: "auto", pb: 0.5 }}>
            <Box onClick={() => navigate('/portfolio')} sx={{
              width: 28, height: 28, borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>
              <ArrowBackIosNewIcon sx={{ fontSize: 11, color: "#fff" }} />
            </Box>
            {projects.map((proj, i) => (
              <ProjectTab key={proj.id} active={i === currentProjectIndex ? 1 : 0} onClick={() => handleProjectChange(i)}
                sx={{ fontSize: "11px", padding: "5px 14px" }}>
                Project -{i + 1}
              </ProjectTab>
            ))}
          </Box>

          {/* Left info */}
          <Typography sx={{ color: "#888", fontSize: "9px", mb: 0.3 }}>{currentProject.label}</Typography>
          <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 700, mb: 1 }}>{currentProject.name}</Typography>
          <Typography sx={{ color: "#aaa", fontSize: "10px", lineHeight: 1.5, mb: 1.5 }}>{currentProject.description}</Typography>

          {/* Image viewer */}
          <Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", minHeight: 0, mb: 1.5 }}>
            <NavArrowBtn onClick={prevSlide} sx={{ position: "absolute", left: -10, zIndex: 2, width: 28, height: 28 }}>
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </NavArrowBtn>
            <Box sx={{
              flex: 1, background: "#fff", borderRadius: "10px", overflow: "hidden",
              height: "100%", mx: "18px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box component="img" src={slides[currentSlide]} alt={`slide-${currentSlide}`}
                sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
            <NavArrowBtn onClick={nextSlide} sx={{ position: "absolute", right: -10, zIndex: 2, width: 28, height: 28 }}>
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </NavArrowBtn>
          </Box>

          {/* Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8 }}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <SliderDot key={i} active={i === currentSlide ? 1 : 0} onClick={() => setCurrentSlide(i)} />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Box sx={{ width: 40, height: 2, background: "#b8ff6e", borderRadius: 2, boxShadow: "0 0 6px #b8ff6e" }} />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default ProjectDetailPage;
