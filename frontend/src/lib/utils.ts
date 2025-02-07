import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getShadePerInterviewsCount(
  count: number,
  tailwindColor: string,
  defaultColor: string = "gray",
  theme: string = "light" // Default to "light" theme
) {

  if (count <= 0) {
    return `bg-${defaultColor}-${
      theme === "dark" ? "800" : "100"
    } text-${defaultColor}-${theme === "dark" ? "400" : "700"}`;
  }

  const lightModeShades = {
    bg: [100, 200, 300, 400, 500],
    text: [800, 800, 900, 900, 900],
  };

  const darkModeShades = {
    bg: [700, 600, 500, 400, 300], // Darker for backgrounds in dark mode
    text: [100, 200, 300, 400, 500], // Lighter for text in dark mode
  };

  const { bg: bgShades, text: textShades } =
    theme === "dark" ? darkModeShades : lightModeShades;

  const thresholds = [1, 3, 5, 10];

  let index = thresholds.findIndex((threshold) => count < threshold);
  if (index === -1) {
    index = thresholds.length; // Use the last shade if count exceeds all thresholds
  }

  index = Math.min(index, bgShades.length - 1);

  return `bg-${tailwindColor}-${bgShades[index]} text-${tailwindColor}-${textShades[index]}`;
}

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

