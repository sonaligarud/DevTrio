// Primary brand color — matches the loader line color
export const PRIMARY = "#00CD1F";

// Helpers for rgba usage
export const primaryAlpha = (opacity) => {
  // Convert #00CD1F → rgb(0, 255, 136)
  return `rgba(0, 255, 136, ${opacity})`;
};
