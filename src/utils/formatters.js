export const getCategoryLabel = (name) => {
  const trimmed = typeof name === "string" ? name.trim() : "";
  return trimmed || "Sin nombre";
};

export const getReadableTextColor = (hexColor) => {
  if (typeof hexColor !== "string") return "#ffffff";

  const normalized = hexColor.trim();
  const shortHexMatch = /^#([a-fA-F0-9]{3})$/.exec(normalized);
  const fullHexMatch = /^#([a-fA-F0-9]{6})$/.exec(normalized);

  let r;
  let g;
  let b;

  if (shortHexMatch) {
    const [rs, gs, bs] = shortHexMatch[1].split("");
    r = Number.parseInt(rs + rs, 16);
    g = Number.parseInt(gs + gs, 16);
    b = Number.parseInt(bs + bs, 16);
  } else if (fullHexMatch) {
    const hex = fullHexMatch[1];
    r = Number.parseInt(hex.slice(0, 2), 16);
    g = Number.parseInt(hex.slice(2, 4), 16);
    b = Number.parseInt(hex.slice(4, 6), 16);
  } else {
    return "#ffffff";
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
};

export const formatRelativeTime = (createdAt) => {
  if (!createdAt) return "Hace unos segundos";

  const sentDate = new Date(createdAt);
  if (Number.isNaN(sentDate.getTime())) return "Hace unos segundos";

  const diffMs = Date.now() - sentDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Hace unos segundos";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
};
