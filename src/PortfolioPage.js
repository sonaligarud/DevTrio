import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

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

const MainMenuTab = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "7px 20px 7px 24px",
  border: "1px solid rgba(255,255,255,0.2)",
  borderBottom: "none",
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(10px)",
  fontSize: "12px",
  color: "#ccc",
  cursor: "pointer",
  clipPath: "polygon(14px 0%, 100% 0%, 100% 100%, 0% 100%)",
});

const CategoryCard = styled(Box)({
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  backdropFilter: "blur(12px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  cursor: "pointer",
  transition: "all 0.25s ease",
  "&:hover": {
    border: "1px solid rgba(0,255,150,0.45)",
    boxShadow: "0 0 18px rgba(0,255,150,0.12)",
    background: "rgba(0,255,150,0.04)",
  },
});

// Mobile pill tab
const PillTab = styled(Button)(({ active }) => ({
  borderRadius: "20px",
  padding: "6px 22px",
  textTransform: "none",
  fontSize: "12px",
  border: active ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.15)",
  color: active ? "#fff" : "#666",
  background: active ? "rgba(255,255,255,0.06)" : "transparent",
  minWidth: 0,
  "&:hover": { background: "rgba(255,255,255,0.08)" },
}));

const desktopCategories = [
  { label: "Print-Designs", icon: "/assets/icons/print-designs.svg" },
  { label: "Social Media",  icon: "/assets/icons/social-media.svg" },
  { label: "UI/UX",         icon: "/assets/icons/UX.svg" },
  { label: "Video",         icon: "/assets/icons/Video.svg" },
  { label: "XR",            icon: "/assets/icons/XR.svg" },
];

const mobileCategories = [
  { label: "UI/UX",         icon: "/assets/icons/UX.svg" },
  { label: "Social Media",  icon: "/assets/icons/social-media.svg" },
  { label: "XR",            icon: "/assets/icons/XR.svg" },
  { label: "Video",         icon: "/assets/icons/Video.svg" },
  { label: "Print-Designs", icon: "/assets/icons/print-designs.svg" },
];

const PortfolioPage = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>

      {/* ══════════════ DESKTOP ══════════════ */}
      <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", height: "100%", p: 4, pr: 6, position: "relative", zIndex: 1 }}>

        {/* Main Menu tab */}
        <Box sx={{ mb: "-1px", zIndex: 2, ml: 0 }}>
          <MainMenuTab onClick={() => navigate('/')}>
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Main Menu
          </MainMenuTab>
        </Box>

        {/* Main card */}
        <Box
          sx={{
            flex: 1,
            borderRadius: "0 16px 16px 16px",
            background: "rgba(15,20,15,0.75)",
            backdropFilter: "blur(25px)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
            px: 6,
            py: 5,
          }}
        >
          {/* HUD frame SVG — sits on top as the border/frame */}
          <Box
            component="img"
            src="/assets/images/hud/project-detail-Page.svg"
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "fill",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Green glow dot — bottom left */}
          <Box sx={{
            position: "absolute", bottom: 20, left: 24,
            width: 10, height: 10, borderRadius: "50%",
            background: "#00ff9c", boxShadow: "0 0 16px 4px rgba(0,255,150,0.6)",
            zIndex: 3,
          }} />

          {/* Right arrow pull-tab — outside card right edge */}
          <Box sx={{
            position: "absolute", right: -20, top: "50%",
            transform: "translateY(-50%)",
            zIndex: 3,
          }}>
            <Box sx={{
              width: 20, height: 52,
              background: "rgba(30,35,30,0.9)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderLeft: "none",
              borderRadius: "0 6px 6px 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              "&:hover": { borderColor: "rgba(0,255,150,0.4)" },
            }}>
              <Box component="img" src="/assets/icons/Desktop_Right_Drawer_Arrow.svg" alt="" sx={{ width: 10 }} />
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1, width: "100%", justifyContent: "center" }}>
            {/* Welcome text — left */}
            <Box sx={{ minWidth: "160px" }}>
              <Typography sx={{ color: "#888", fontSize: "13px", mb: 0.5, fontWeight: 400 }}>Welcome!</Typography>
              <Typography sx={{ color: "#fff", fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>
                Here is my work
              </Typography>
            </Box>

            {/* Category grid — right */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 175px)",
              gridTemplateRows: "repeat(3, 115px)",
              gap: "14px",
            }}>
              {desktopCategories.map((cat, i) => (
                <CategoryCard
                  key={i}
                  onClick={() => navigate(`/portfolio/${encodeURIComponent(cat.label)}`)}
                  sx={{ ...(i === 4 && { gridColumn: "1 / 2" }) }}
                >
                  <Box component="img" src={cat.icon} alt={cat.label} sx={{ width: 36, height: 36, objectFit: "contain" }} />
                  <Typography sx={{ fontSize: "11px", color: "#bbb", letterSpacing: "0.5px", fontWeight: 500 }}>
                    {cat.label}
                  </Typography>
                </CategoryCard>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════ MOBILE ══════════════ */}
      <Box sx={{
        display: { xs: "flex", md: "none" },
        flexDirection: "column",
        height: "100%",
        px: 2, pt: 2.5, pb: 2,
        position: "relative", zIndex: 1,
      }}>
        {/* Pill tabs */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <PillTab active={1} onClick={() => navigate('/')}>Main Menu</PillTab>
        </Box>

        {/* Card */}
        <Box sx={{
          flex: 1,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          px: 2.5, pt: 3, pb: 2.5,
          overflow: "hidden",
        }}>
          {/* HUD background */}
          <Box
            component="img"
            src="/assets/images/hud/project-detail-Page.svg"
            alt=""
            sx={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "fill", pointerEvents: "none", zIndex: 0,
            }}
          />

          {/* Green dot right edge */}
          <Box sx={{
            position: "absolute", right: 0, top: "35%",
            width: 4, height: 28,
            background: "#00ff9c", borderRadius: "4px 0 0 4px",
            boxShadow: "0 0 8px #00ff9c", zIndex: 1,
          }} />

          {/* Green dot bottom-left */}
          <Box sx={{
            position: "absolute", bottom: 14, left: 16,
            width: 8, height: 8, borderRadius: "50%",
            background: "#00ff9c", boxShadow: "0 0 10px rgba(0,255,150,0.7)",
            zIndex: 1,
          }} />

          {/* Welcome text */}
          <Box sx={{ mb: 2.5, zIndex: 1 }}>
            <Typography sx={{ color: "#888", fontSize: "12px" }}>Welcome!</Typography>
            <Typography sx={{ color: "#fff", fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>
              Here is my work
            </Typography>
          </Box>

          {/* Cards grid */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "90px",
            gap: "10px",
            flex: 1,
            zIndex: 1,
          }}>
            {mobileCategories.map((cat, i) => (
              <CategoryCard
                key={i}
                onClick={() => navigate(`/portfolio/${encodeURIComponent(cat.label)}`)}
                sx={{ ...(i === 4 && { gridColumn: "1 / 2" }) }}
              >
                <Box component="img" src={cat.icon} alt={cat.label} sx={{ width: 32, height: 32, objectFit: "contain" }} />
                <Typography sx={{ fontSize: "10px", color: "#aaa", letterSpacing: "0.5px" }}>
                  {cat.label}
                </Typography>
              </CategoryCard>
            ))}
          </Box>
        </Box>

        {/* Bottom green line */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Box sx={{ width: 40, height: 2, background: "#00ff9c", borderRadius: 2, boxShadow: "0 0 6px #00ff9c" }} />
        </Box>
      </Box>

    </PageWrapper>
  );
};

export default PortfolioPage;
