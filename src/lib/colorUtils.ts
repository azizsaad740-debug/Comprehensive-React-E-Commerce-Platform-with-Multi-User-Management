/**
 * Converts a hex color code to an HSL string suitable for Tailwind CSS variables.
 * Format: "H S% L%"
 * 
 * @param hex The hex color code (e.g., #FF0000 or FF0000)
 * @returns HSL string (e.g., "0 100% 50%") or null if invalid
 */
export function hexToHsl(hex: string): string | null {
  // Remove '#' if present
  hex = hex.startsWith('#') ? hex.slice(1) : hex;

  if (hex.length !== 6) {
    return null;
  }

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find min and max of RGB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages, rounding to integers
  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  // Return in Tailwind format: "H S% L%"
  return `${hue} ${saturation}% ${lightness}%`;
}

/**
 * Converts a hex color code to a raw HSL string (H S L) for use in CSS variables.
 * Format: "H S L" (no percent signs)
 * 
 * @param hex The hex color code (e.g., #FF0000 or FF0000)
 * @returns HSL string (e.g., "0 100 50") or null if invalid
 */
export function hexToRawHsl(hex: string): string | null {
  const hslString = hexToHsl(hex);
  if (!hslString) return null;
  
  // Remove '%' and replace spaces with single space
  return hslString.replace(/%/g, '').trim();
}