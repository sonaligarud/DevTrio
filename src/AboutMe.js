import React, { useState, useEffect } from "react";
import { Box, Typography, Modal, useMediaQuery, useTheme, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

/* ── Styled components ── */
const ModalBox = styled(Box)(({ mobile }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: mobile ? "100vw" : "860px",
  maxWidth: mobile ? "100vw" : "95vw",
  maxHeight: mobile ? "100dvh" : "88vh",
  height: mobile ? "100dvh" : "auto",
  overflowY: "auto",
  background: "rgba(8, 11, 8, 0.97)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: mobile ? "none" : "1px solid rgba(0,255,150,0.12)",
  borderRadius: mobile ? 0 : "20px",
  padding: mobile ? "24px 20px 32px" : "32px 36px 32px",
  color: "#fff",
  boxShadow: mobile ? "none" : "0 0 60px rgba(0,255,150,0.08)",
  "&::-webkit-scrollbar": { width: "4px" },
  "&::-webkit-scrollbar-thumb": { background: "rgba(0,255,150,0.25)", borderRadius: "4px" },
}));

const Tab = styled(Box)(({ active }) => ({
  padding: "6px 18px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  color: active ? "#000" : "#888",
  background: active ? "#00ff9c" : "transparent",
  border: active ? "none" : "1px solid rgba(255,255,255,0.12)",
  transition: "all 0.2s",
  "&:hover": {
    color: active ? "#000" : "#fff",
    borderColor: active ? "none" : "rgba(255,255,255,0.3)",
  },
}));

const ExpCard = styled(Box)({
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "12px",
  padding: "14px 16px",
  minWidth: "130px",
  flexShrink: 0,
  transition: "border 0.2s",
  "&:hover": { border: "1px solid rgba(0,255,150,0.35)" },
});

const CertCard = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "14px",
  padding: "14px 20px",
  borderRadius: "14px",
  backdropFilter: "blur(38px)",
  WebkitBackdropFilter: "blur(38px)",
  boxShadow: "0 6px 13px 0 rgba(0,0,0,0.3), inset 0 1px 2px 0 rgba(0,0,0,0.25)",
  background: `linear-gradient(#0b0b0b, #0b0b0b) padding-box,
    linear-gradient(100deg, #8f8f8f 1%, #636363 27%, #00cd1f 48%, #636363 69%, #8f8f8f 97%) border-box`,
  border: "1px solid transparent",
});

const DownloadBtn = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  borderRadius: "10px",
  border: "1px solid rgba(0,255,150,0.35)",
  background: "rgba(0,255,150,0.06)",
  cursor: "pointer",
  color: "#00ff9c",
  fontSize: "13px",
  fontWeight: 500,
  whiteSpace: "nowrap",
  transition: "background 0.2s, box-shadow 0.2s",
  "&:hover": {
    background: "rgba(0,255,150,0.12)",
    boxShadow: "0 0 14px rgba(0,255,150,0.2)",
  },
});

/* ── Data ── */
const experiences = [
  { company: "Publicis Sapient", role: "Art Director", period: "2022 – Present" },
  { company: "Evonix", role: "Art Director", period: "2019 – 2022" },
  { company: "Creative Studio", role: "Project Manager", period: "2018 – 2019" },
  { company: "SRV Media", role: "Assistant Manager", period: "2015 – 2018" },
  { company: "Affinity Express", role: "Sr. Designer", period: "2012 – 2015" },
];

const skills = [
  "Product Design", "Motion Design", "Interaction Design", "Team Leadership",
  "Design Systems", "Creative Direction", "Brand Identity", "UX Design",
];

const workCategories = [
  { label: "UI/UX", icon: "/assets/icons/UX.svg" },
  { label: "Social Media", icon: "/assets/icons/social-media.svg" },
  { label: "Video", icon: "/assets/icons/Video.svg" },
  { label: "Print Media", icon: "/assets/icons/print-designs.svg" },
];

const WorkCategoryCard = styled(Box)({
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "20px 16px",
  cursor: "pointer",
  flex: 1,
  transition: "all 0.2s",
  "&:hover": {
    border: "1px solid rgba(0,255,150,0.4)",
    background: "rgba(0,255,150,0.04)",
    boxShadow: "0 0 16px rgba(0,255,150,0.1)",
  },
});

/* ── Work tab ── */
function WorkTab({ onClose }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(workCategories);

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const fallbackIcons = {
            "Print-Designs": "/assets/icons/print-designs.svg",
            "Social Media": "/assets/icons/social-media.svg",
            "UI/UX": "/assets/icons/UX.svg",
            "Video": "/assets/icons/Video.svg",
            "XR": "/assets/icons/XR.svg",
            "Software": "/assets/icons/UX.svg",
            "Print Media": "/assets/icons/print-designs.svg",
          };
          const mapped = data.map(cat => ({
            label: cat,
            icon: fallbackIcons[cat] || "/assets/icons/UX.svg"
          }));
          setCategories(mapped);
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  const handleCategoryClick = (label) => {
    onClose();
    navigate(`/portfolio/${encodeURIComponent(label)}`);
  };

  return (
    <Box>
      {/* Category cards row */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <WorkCategoryCard key={cat.label} onClick={() => handleCategoryClick(cat.label)}>
            <Box
              component="img"
              src={cat.icon}
              alt={cat.label}
              sx={{ width: 36, height: 36, objectFit: "contain" }}
            />
            <Typography sx={{ fontSize: "12px", color: "#bbb", letterSpacing: "0.5px", fontWeight: 500 }}>
              {cat.label}
            </Typography>
          </WorkCategoryCard>
        ))}
      </Box>

      {/* Bio text */}
      <Typography sx={{ fontSize: "12px", color: "#666", lineHeight: 1.8, mb: 3 }}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
      </Typography>

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)", mb: 2.5 }} />

      {/* Download Resume */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <DownloadBtn>
          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
          Download Resume
        </DownloadBtn>
      </Box>
    </Box>
  );
}

/* ── About Me tab content ── */
function AboutMeTab({ mobile }) {
  return (
    <>
      {/* Experience label */}
      <Typography sx={{ color: "#666", fontSize: "11px", letterSpacing: "1.2px", textTransform: "uppercase", mb: 1.5 }}>
        Experience
      </Typography>

      {/* Experience cards – horizontal scroll */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 1,
          mb: 3,
          "&::-webkit-scrollbar": { height: "3px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(0,255,150,0.25)", borderRadius: "4px" },
        }}
      >
        {experiences.map((exp) => (
          <ExpCard key={exp.company}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
              {exp.company}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#888", mt: 0.4 }}>{exp.role}</Typography>
            <Typography sx={{ fontSize: "10px", color: "#555", mt: 0.3 }}>{exp.period}</Typography>
          </ExpCard>
        ))}
      </Box>

      {/* Cert card */}
      <CertCard sx={{ mb: 3 }}>
        <Box component="img" src="/assets/icons/UX-Certification.svg" alt="cert" sx={{ width: 40, height: 40, flexShrink: 0 }} />
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
            UI/UX Design with Generative AI
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#777", mt: 0.3 }}>
            International Institute of Information Technology Bangalore (IIIT-B)
          </Typography>
        </Box>
      </CertCard>

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)", mb: 2.5 }} />

      {/* Skills left, Download Resume right */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        {/* Skills chips — left */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ccc",
                fontSize: "11px",
                borderRadius: "8px",
                transition: "all 0.2s",
                "&:hover": {
                  background: "rgba(0,255,150,0.08)",
                  borderColor: "rgba(0,255,150,0.35)",
                  color: "#00ff9c",
                },
              }}
            />
          ))}
        </Box>

        {/* Download Resume — right */}
        <DownloadBtn>
          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
          Download Resume
        </DownloadBtn>
      </Box>
    </>
  );
}

/* ── Main modal content ── */
function AboutMeContent({ onClose, mobile }) {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <>
      {/* Header: name + tabs + close */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        {/* Left: greeting + name */}
        <Box>
          <Typography sx={{ color: "#888", fontSize: "12px", letterSpacing: "0.5px", mb: 0.5 }}>
            Welcome to the Portfolio!
          </Typography>
          <Typography sx={{ fontSize: mobile ? "26px" : "32px", fontWeight: 700, lineHeight: 1.1 }}>
            Akash <span style={{ color: "#00ff9c" }}>P</span>
          </Typography>
        </Box>

        {/* Right: tabs + close */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
          <Tab active={activeTab === "work" ? 1 : 0} onClick={() => setActiveTab("work")}>
            Work
          </Tab>
          <Tab active={activeTab === "about" ? 1 : 0} onClick={() => setActiveTab("about")}>
            About Me
          </Tab>
        </Box>
      </Box>

      {/* Tab content */}
      {activeTab === "work" ? <WorkTab onClose={onClose} /> : <AboutMeTab mobile={mobile} />}
    </>
  );
}

/* ── Export inline content (for embedding without Modal) ── */
export { AboutMeContent };

/* ── Export ── */
export default function AboutMe({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 999999 }}>
      <ModalBox mobile={isMobile ? 1 : 0}>
        <AboutMeContent onClose={onClose} mobile={isMobile} />
      </ModalBox>
    </Modal>
  );
}
