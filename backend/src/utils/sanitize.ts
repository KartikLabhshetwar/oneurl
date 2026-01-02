export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .normalize("NFKC");
}

export function sanitizeUrl(url: string): string {
  try {
    const trimmed = url.trim();
    if (!trimmed) return "";
    
    let parsed: URL;
    
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      parsed = new URL(`https://${trimmed}`);
    } else {
      parsed = new URL(trimmed);
    }
    
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
    
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/[<>"']/g, "");
    
    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizeTitle(input: string): string {
  return sanitizeString(input)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"']/g, "")
    .slice(0, 50);
}

