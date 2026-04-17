import React, { useState } from "react";
import { Box, Typography, Modal, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"; // kept for fallback
import { PRIMARY, primaryAlpha } from "./theme";

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
  border: mobile ? "none" : `1px solid ${primaryAlpha(0.12)}`,
  borderRadius: mobile ? 0 : "20px",
  padding: mobile ? "24px 20px 32px" : "32px 36px 32px",
  color: "#fff",
  boxShadow: mobile ? "none" : `0 0 60px ${primaryAlpha(0.08)}`,
  "&::-webkit-scrollbar": { width: "4px" },
  "&::-webkit-scrollbar-thumb": { background: primaryAlpha(0.25), borderRadius: "4px" },
}));

const Tab = styled(Box)(({ active }) => ({
  position: "relative",
  padding: "6px 22px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  color: active ? PRIMARY : "rgba(255,255,255,0.75)",
  background: active
    ? `linear-gradient(#0b0b0b, #0b0b0b) padding-box, linear-gradient(100deg, #8f8f8f 1%, #636363 27%, ${PRIMARY} 48%, #636363 69%, #8f8f8f 97%) border-box`
    : "rgba(255,255,255,0.04)",
  border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(50px)",
  WebkitBackdropFilter: "blur(50px)",
  transition: "all 0.2s",
  "&::after": active ? {
    content: '""',
    position: "absolute",
    bottom: "-8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "7px solid transparent",
    borderRight: "7px solid transparent",
    borderTop: `8px solid ${PRIMARY}`,
  } : { content: '""' },
  "&:hover": {
    color: PRIMARY,
    background: `linear-gradient(#0b0b0b, #0b0b0b) padding-box, linear-gradient(100deg, #8f8f8f 1%, #636363 27%, ${PRIMARY} 48%, #636363 69%, #8f8f8f 97%) border-box`,
    border: "1px solid transparent",
  },
  "&:hover::after": {
    content: '""',
    position: "absolute",
    bottom: "-8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "7px solid transparent",
    borderRight: "7px solid transparent",
    borderTop: `8px solid ${PRIMARY}`,
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
  "&:hover": { border: `1px solid ${primaryAlpha(0.35)}` },
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
    linear-gradient(100deg, #8f8f8f 1%, #636363 27%, ${PRIMARY} 48%, #636363 69%, #8f8f8f 97%) border-box`,
  border: "1px solid transparent",
});

const DownloadBtn = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 24px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(20,25,20,0.9)",
  cursor: "pointer",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 500,
  whiteSpace: "nowrap",
  transition: "background 0.2s, box-shadow 0.2s",
  "&:hover": {
    background: "rgba(30,35,30,0.95)",
    borderColor: primaryAlpha(0.4),
    boxShadow: `0 0 14px ${primaryAlpha(0.15)}`,
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


const workCategories = [
  { label: "UI/UX", icon: "/assets/icons/UX.svg" },
  { label: "Social Media", icon: "/assets/icons/social-media.svg" },
  { label: "Video", icon: "/assets/icons/Video.svg" },
  { label: "Print Media", icon: "/assets/icons/print-designs.svg" },
];


/* ── Work tab ── */
function WorkTab({ onClose }) {
  const navigate = useNavigate();

  const handleCategoryClick = (label) => {
    onClose();
    navigate(`/portfolio/${encodeURIComponent(label)}`);
  };

  return (
    <Box>
      {/* Category cards — single row, 4 equal cols */}
      <Box sx={{ display: "flex", gap: "12px", mb: "24px" }}>
        {workCategories.map((cat) => (
          <Box
            key={cat.label}
            onClick={() => handleCategoryClick(cat.label)}
            sx={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "10px", py: "28px", cursor: "pointer",
              backgroundImage: "url(/assets/images/bg-images/without-hover.svg)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              borderRadius: "14px",
              transition: "background-image 0.2s",
              "& .cat-icon": { filter: "brightness(0) invert(0.5)", transition: "filter 0.2s" },
              "& .cat-label": { color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 500, transition: "color 0.2s" },
              "&:hover": {
                backgroundImage: "url(/assets/images/bg-images/with-hover.svg)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                "& .cat-icon": { filter: "brightness(0) invert(1)" },
                "& .cat-label": { color: "#fff" },
              },
            }}
          >
            <Box component="img" src={cat.icon} alt={cat.label} className="cat-icon"
              sx={{ width: 36, height: 36, objectFit: "contain" }} />
            <Typography className="cat-label">{cat.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Bio + Download Resume */}
           {/* Skills rows + Download Resume */}
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3,margin:"0px 100px"}}>
        <Typography sx={{ fontSize: "13px", lineHeight: 1.8, flex: 1,textAlign:"left" }}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
        </Typography>
        <DownloadBtn sx={{ flexShrink: 0}}>
          <Box component="img" src="/assets/icons/download-resume.svg" alt="" sx={{ width: 18, height: 18 }} />
          Download Resume
        </DownloadBtn>
      </Box>
    </Box>
  );
}

/* ── About Me tab content ── */
function AboutMeTab({ mobile }) {

  return (
    <Box sx={{padding:'40px 90px'}}>
      {/* Experience label */}
      <Typography sx={{ fontSize: "12px", letterSpacing: "1.2px", mb: 1.5,textAlign:'left' }}>
        Experience
      </Typography>

      {/* Experience cards – horizontal scroll */}
      <Box sx={{
        display: "flex", gap: 1.5, overflowX: "auto", pb: 1, mb: 2.5,
        "&::-webkit-scrollbar": { height: "3px" },
        textAlign:"left",
        "&::-webkit-scrollbar-thumb": { background: primaryAlpha(0.25), borderRadius: "4px" },
      }}>
        {experiences.map((exp) => (
          <ExpCard key={exp.company}>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
              {exp.company}
            </Typography>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff", mt: 0.2, whiteSpace: "nowrap" }}>
              {exp.role}
            </Typography>
            <Typography sx={{ fontSize: "11px", mt: 0.3, whiteSpace: "nowrap" }}>
              {exp.period}
            </Typography>
          </ExpCard>
        ))}
      </Box>

      {/* Cert card */}
      <CertCard sx={{ mb: 2.5}}>
        <Box component="img" src="/assets/icons/UX-Certification.svg" alt="cert" sx={{ width: 40, height: 40, flexShrink: 0 }} />
        <Box sx={{textAlign:"left"}}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#fff"}}>
            UI/UX Design with Generative AI
          </Typography>
          <Typography sx={{ fontSize: "11px", mt: 0.3 }}>
            International Institute of Information Technology Bangalore (IIIT-B)
          </Typography>
        </Box>
      </CertCard>

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)", mb: 2 }} />

      {/* Skills rows + Download Resume */}
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3}}>
        <Typography sx={{ fontSize: "13px", lineHeight: 1.8, flex: 1,textAlign:"left" }}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
        </Typography>
        <DownloadBtn sx={{ flexShrink: 0}}>
          <Box component="img" src="/assets/icons/download-resume.svg" alt="" sx={{ width: 18, height: 18 }} />
          Download Resume
        </DownloadBtn>
      </Box>
    </Box>
  );
}

/* ── Main modal content ── */
function AboutMeContent({ onClose, mobile }) {
  const [activeTab, setActiveTab] = useState("work");

  return (
    <>
      {/* Header: greeting + name on left, tabs on right */}
      <Box sx={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", mb: "24px",
        margin:"0px 90px"
      }}>
        <Box sx={{textAlign:"left"}}> 
          <Typography sx={{ fontSize: "14px",mb: "4px" }}>
            Welcome to the Portfolio!
          </Typography>
          <Typography sx={{ fontSize: mobile ? "24px" : "28px", fontWeight: 700, lineHeight: 1.1, color: PRIMARY }}>
            Akash P
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "4px" }}>
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
