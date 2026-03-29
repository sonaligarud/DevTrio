import React from "react";
import { Box, Typography, IconButton, Modal, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import SchoolIcon from "@mui/icons-material/School";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import BrushIcon from "@mui/icons-material/Brush";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import EmailIcon from "@mui/icons-material/Email";

/* ── Desktop modal box ── */
const DesktopModalBox = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1000px",
  maxWidth: "95vw",
  maxHeight: "85vh",
  overflowY: "auto",
  background: "rgba(10,14,10,0.92)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(0,255,150,0.15)",
  borderRadius: "20px",
  padding: "40px",
  color: "#fff",
  boxShadow: "0 0 60px rgba(0,255,150,0.1)",
  "&::-webkit-scrollbar": { width: "4px" },
  "&::-webkit-scrollbar-thumb": { background: "rgba(0,255,150,0.3)", borderRadius: "4px" },
});

/* ── Mobile full-screen box ── */
const MobileBox = styled(Box)({
  position: "absolute",
  inset: 0,
  background: "#080c09",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  "&::-webkit-scrollbar": { display: "none" },
});

const ExperienceCard = styled(Box)({
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "14px 16px",
  cursor: "default",
  transition: "border 0.2s",
  "&:hover": { border: "1px solid rgba(0,255,150,0.4)" },
});

const SkillItem = ({ children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
    <ArrowOutwardIcon sx={{ fontSize: 16, color: "#00ff9c", flexShrink: 0 }} />
    <Typography sx={{ fontSize: "13px", color: "#ccc" }}>{children}</Typography>
  </Box>
);

const CertCard = styled(Box)({
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "16px 20px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const SocialBtn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
  color: "#aaa",
  fontSize: "11px",
  flex: 1,
  transition: "color 0.2s",
  "&:hover": { color: "#00ff9c" },
});

const experiences = [
  { company: "Publicis Sapient", role: "Art Director", period: "2022 – Present" },
  { company: "Evonix Technologies", role: "Art Director", period: "2019 – 2022" },
  { company: "Creative Studio", role: "Project Manager", period: "2018 – 2019" },
  { company: "SRV Media", role: "Assistant Manager", period: "2015 – 2018" },
  { company: "Affinity Express", role: "Sr. Graphic Designer", period: "2012 – 2015" },
  { company: "Mancers Info Pvt. Ltd.", role: "Jr. Graphic Designer", period: "2010 – 2011" },
];

const skillsLeft = ["Product Design", "Design Systems", "Interaction Design", "Brand Identity"];
const skillsRight = ["Motion Design", "Creative Direction", "Team Leadership", "UX Design"];

const socials = [
  { label: "Dribbble",  Icon: SportsBasketballIcon },
  { label: "Behance",   Icon: BrushIcon },
  { label: "LinkedIn",  Icon: LinkedInIcon },
  { label: "Mobile",    Icon: SmartphoneIcon },
  { label: "Mail",      Icon: EmailIcon },
];

/* ────────────────────────────────────────────
   MOBILE LAYOUT
──────────────────────────────────────────── */
function MobileView({ onClose }) {
  return (
    <MobileBox>
      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", pb: "90px", "&::-webkit-scrollbar": { display: "none" } }}>
        {/* Back button */}
        <Box sx={{ p: 2, pt: 3 }}>
            <Box component="img" src="/assets/icons/cancle.svg" alt="close" />
        </Box>

        <Box sx={{ px: 3, pb: 2 }}>
          {/* Heading */}
          <Typography sx={{ color: "#aaa", fontSize: "14px", mb: 0.5 }}>Hello!</Typography>
          <Typography sx={{ fontSize: "26px", fontWeight: 600, lineHeight: 1.3, mb: 3 }}>
            My Name is{" "}
            <span style={{ color: "#00ff9c" }}>Akash Pardeshi</span>
          </Typography>

          {/* Experience */}
          <Typography sx={{ color: "#888", fontSize: "12px", mb: 1.5, letterSpacing: "1px" }}>
            Experience
          </Typography>

          {/* 2-column grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 3,
            }}
          >
            {experiences.map((exp) => (
              <ExperienceCard key={exp.company}>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>
                  {exp.company}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#888", mt: 0.3 }}>{exp.role}</Typography>
                <Typography sx={{ fontSize: "10px", color: "#555", mt: 0.3 }}>{exp.period}</Typography>
              </ExperienceCard>
            ))}
          </Box>

          {/* Divider */}
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)", mb: 2.5 }} />

          {/* Skills – 2 columns */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", mb: 3 }}>
            <Box>{skillsLeft.map((s) => <SkillItem key={s}>{s}</SkillItem>)}</Box>
            <Box>{skillsRight.map((s) => <SkillItem key={s}>{s}</SkillItem>)}</Box>
          </Box>

          {/* Certification */}
          <CertCard>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "rgba(0,255,150,0.08)",
                border: "1px solid rgba(0,255,150,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SchoolIcon sx={{ color: "#00ff9c", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                UI/UX Design with Generative AI
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#777", mt: 0.3 }}>
                International Institute of Information Technology Bangalore (IIIT-B)
              </Typography>
            </Box>
          </CertCard>
        </Box>
      </Box>

      {/* Fixed bottom social bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(8,12,9,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          py: 1.5,
          px: 1,
        }}
      >
        {socials.map(({ label, Icon }) => (
          <SocialBtn key={label}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                border: "1.5px solid rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                boxShadow: "inset 0 0 8px rgba(255,255,255,0.03)",
                transition: "border 0.2s, box-shadow 0.2s",
                "&:hover": {
                  border: "1.5px solid #00ff9c",
                  boxShadow: "0 0 10px rgba(0,255,150,0.3)",
                },
              }}
            >
              <Icon sx={{ fontSize: 22, color: "inherit" }} />
            </Box>
            <Typography sx={{ fontSize: "10px", color: "inherit" }}>{label}</Typography>
          </SocialBtn>
        ))}
      </Box>
    </MobileBox>
  );
}

/* ────────────────────────────────────────────
   DESKTOP LAYOUT
──────────────────────────────────────────── */
function DesktopView({ onClose }) {
  return (
    <DesktopModalBox>
      {/* Close */}
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          cursor:"pointer"
        }}
      >
        <Box component="img" src="/assets/icons/cancle.svg" alt="close" />
      </Box>

      <Typography sx={{ color: "#888", fontSize: "13px", mb: 0.5 }}>Hello!</Typography>
      <Typography sx={{ fontSize: "28px", fontWeight: 600, mb: 3 }}>
        My Name is <span style={{ color: "#00ff9c" }}>Akash Pardeshi</span>
      </Typography>

      <Typography sx={{ color: "#888", fontSize: "12px", mb: 1.5, letterSpacing: "1px" }}>
        Experience
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 1,
          mb: 3,
          "&::-webkit-scrollbar": { height: "3px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(0,255,150,0.3)", borderRadius: "4px" },
        }}
      >
        {experiences.map((exp) => (
          <ExperienceCard key={exp.company} sx={{ minWidth: "130px" }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
              {exp.company}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#888", mt: 0.3 }}>{exp.role}</Typography>
            <Typography sx={{ fontSize: "10px", color: "#555", mt: 0.3 }}>{exp.period}</Typography>
          </ExperienceCard>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 4, flex: 1 }}>
          <Box>{skillsLeft.map((s) => <SkillItem key={s}>{s}</SkillItem>)}</Box>
          <Box>{skillsRight.map((s) => <SkillItem key={s}>{s}</SkillItem>)}</Box>
        </Box>
        <CertCard sx={{ flex: 1, minWidth: "240px" }}>
          <Box>
            <img src= "assets/icons/UX-Certification.svg"/>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
              UI/UX Design with Generative AI
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#777", mt: 0.3 }}>
              International Institute of Information Technology Bangalore (IIIT-B)
            </Typography>
          </Box>
        </CertCard>
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)", mb: 3 }} />

      <Box sx={{ display: "flex", gap: 3 }}>
        {socials.map(({ label, Icon }) => (
          <Box key={label} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer", color: "#aaa", "&:hover": { color: "#00ff9c" } }}>
            <Icon sx={{ fontSize: 28, color: "inherit" }} />
            <Typography sx={{ fontSize: "11px", color: "inherit" }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </DesktopModalBox>
  );
}

/* ────────────────────────────────────────────
   EXPORT
──────────────────────────────────────────── */
export default function AboutMe({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal open={open} onClose={onClose}>
      <>
        {isMobile ? <MobileView onClose={onClose} /> : <DesktopView onClose={onClose} />}
      </>
    </Modal>
  );
}
