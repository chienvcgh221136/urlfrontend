import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  if (!dateString) return "Invalid date";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const truncateUrl = (url: string, maxLength: number) => {
  // Kiểm tra đầu vào để tránh lỗi
  if (!url || typeof url !== "string") {
    return ""; // Trả về chuỗi rỗng nếu url không hợp lệ
  }

  if (url.length > maxLength) {
    return url.substring(0, maxLength) + "...";
  }
  return url;
};

// Construct display URL with full UTM parameters
export const getDisplayUrl = (
  baseUrl: string,
  shortCode: string,
  originalUrl: string
): string => {
  let shortUrl = `${baseUrl}/${shortCode}`;

  if (!originalUrl) return shortUrl;

  try {
    const urlToParse = originalUrl.startsWith('http') ? originalUrl : `http://${originalUrl}`;
    const urlObj = new URL(urlToParse);
    const params = new URLSearchParams(urlObj.search);
    const utmParams: string[] = [];

    // Iterate over all params and keep ALL UTM parameters (key=value)
    params.forEach((value, key) => {
      if (key.toLowerCase().startsWith('utm_')) {
        utmParams.push(`${key}=${value}`);
      }
    });

    if (utmParams.length > 0) {
      shortUrl += `?${utmParams.join('&')}`;
    }
  } catch (e) {
    // Ignore URL parse errors
  }

  return shortUrl;
};
