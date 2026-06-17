import React from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgba(45, 50, 48, 0.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    position: "relative",
    maxWidth: "180px",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "rgba(45, 50, 48, 0.95)",
    "&::before": {
      border: "1px solid rgba(255,255,255,0.08)",
    },
  },
}));

export default function CustomTooltip({ title, children, placement = "top" }) {
  return (
    <StyledTooltip
      placement={placement}
      slotProps={{ popper: { sx: { zIndex: 9999999 } } }}
      title={
        <Box sx={{ position: "relative", pb: "4px" }}>
          <Typography sx={{ fontSize: "10.5px", lineHeight: 1.4, color: "rgba(255,255,255,0.85)", fontWeight: 500, textAlign: "left" }}>
            {title}
          </Typography>
          <Box sx={{ position: "absolute", bottom: -4, left: 0, width: "35%", height: "2px", background: "#00CD1F", borderRadius: "2px" }} />
        </Box>
      }
    >
      {children}
    </StyledTooltip>
  );
}
