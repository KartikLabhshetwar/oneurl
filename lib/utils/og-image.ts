export function getOgImageUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "");
    
    return `https://${domain}/og.png`;
  } catch {
    return "";
  }
}

export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const ogUrl = getOgImageUrl(url);
    if (!ogUrl) return null;
    
    const response = await fetch(ogUrl, { 
      method: "HEAD",
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      return ogUrl;
    }
  } catch {
  }
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "");
    return `https://${domain}/og.png`;
  } catch {
    return null;
  }
}

