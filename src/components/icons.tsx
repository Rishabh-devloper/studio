import type { SVGProps } from "react";

export function WealthWiseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
      <path d="M8.5 8.5 6 6" />
      <path d="M15.5 8.5 18 6" />
      <path d="M8.5 15.5 6 18" />
      <path d="M15.5 15.5 18 18" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
