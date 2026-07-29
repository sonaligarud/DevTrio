import React, { useState } from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip
    {...props}
    arrow
    classes={{ popper: className }}
  />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background:
      "linear-gradient(180deg, #303534 0%, #202323 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "14px",
    maxWidth: 220,
    boxShadow: "0 18px 45px rgba(0,0,0,.55)",
    position: "relative",
    overflow: "visible",
  },

  [`& .${tooltipClasses.arrow}`]: {
    color: "#202323",
  },

  // Bottom notch
  [`& .${tooltipClasses.tooltip}::after`]: {
    content: '""',
    position: "absolute",
    bottom: "-6px",
    left: "28px",
    width: "28px",
    height: "10px",
    background: "#202323",
    clipPath: "polygon(0 0,100% 0,82% 100%,18% 100%)",
  },
}));


export default function CustomTooltip({
  title,
  children,
  placement = "top",
}) {
  const [open, setOpen] = useState(true); // Open by default

  return (
    <StyledTooltip
      open={open}
      placement={placement}
      arrow
      slotProps={{
        popper: {
          sx: { zIndex: 9999999 },
        },
      }}
      title={
        <Box sx={{ position: "relative", pr: 3 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              bgcolor: "#343838",
              color: "#fff",
              border: "1px solid rgba(0,255,120,.35)",
              "& svg": {
                fontSize: 14,
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
              fontSize: 15,
              color: "#fff",
              mb: 1.5,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 2,
              bgcolor: "rgba(255,255,255,.25)",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: "70%",
                height: "100%",
                bgcolor: "#00CD1F",
              }}
            />
          </Box>
        </Box>
      }
    >
      <Box display="inline-block">
        {children}
      </Box>
    </StyledTooltip>
  );
}