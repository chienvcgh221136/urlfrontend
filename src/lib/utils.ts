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
