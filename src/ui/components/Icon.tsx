import React from "react";

export type IconName =
  | "shuffle"
  | "previous"
  | "play"
  | "pause"
  | "next"
  | "repeat"
  | "repeatOne"
  | "pin"
  | "camera"
  | "plusCircle"
  | "home"
  | "search"
  | "library"
  | "compass"
  | "help"
  | "mic"
  | "ring"
  | "chevronRight"
  | "chevronLeft"
  | "close"
  | "overflow"
  | "heart"
  | "share"
  | "plus"
  | "speaker";

type Props = {
  name: IconName;
  size?: number;
  title?: string;
  className?: string;
};

function Paths({ name }: { name: IconName }) {
  switch (name) {
    case "home":
      return <path d="M12 3l9 8v10h-6v-6H9v6H3V11l9-8z" fill="currentColor" />;
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "library":
      return (
        <>
          <path d="M4 6h2v14H4V6zM8 6h2v14H8V6z" fill="currentColor" />
          <path d="M12 6h8v14h-8V6z" fill="currentColor" opacity="0.9" />
        </>
      );
    case "compass":
      return (
        <>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
          <path
            d="M15.8 8.2l-2.1 5.7-5.5 2.1 2.1-5.7 5.5-2.1z"
            fill="currentColor"
          />
        </>
      );
    case "help":
      return (
        <>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
          <path
            d="M10.9 10a1.7 1.7 0 013.2.7c0 1.2-1 1.6-1.6 2-.5.3-.7.5-.7 1.3v.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="12" cy="17.3" r="1.1" fill="currentColor" />
        </>
      );
    case "shuffle":
      return (
        <path
          d="M16 4h4v4h-2V7.4l-2.3 2.3a4 4 0 01-2.8 1.2H4V9h8.9a2 2 0 001.4-.6L16.6 6H16V4zm2 12.6V16h2v4h-4v-2h.6l-2.3-2.3a2 2 0 00-1.4-.6H4v-2h8.9a4 4 0 012.8 1.2l2.3 2.3z"
          fill="currentColor"
        />
      );
    case "repeat":
      return (
        <path
          d="M7 7h12v3l3-3-3-3v2H5a3 3 0 00-3 3v4h2V9a2 2 0 012-2zm10 10H5v-3l-3 3 3 3v-2h14a3 3 0 003-3v-4h-2v4a2 2 0 01-2 2z"
          fill="currentColor"
        />
      );
    case "repeatOne":
      return (
        <>
          <path
            d="M7 7h12v3l3-3-3-3v2H5a3 3 0 00-3 3v4h2V9a2 2 0 012-2zm10 10H5v-3l-3 3 3 3v-2h14a3 3 0 003-3v-4h-2v4a2 2 0 01-2 2z"
            fill="currentColor"
            opacity="0.9"
          />
          <path d="M12.2 10.1h-1.1l-1 1 .9.9.6-.6V16h1.3v-5.9z" fill="currentColor" />
        </>
      );
    case "pin":
      return (
        <path
          d="M14.8 3.6l5.6 5.6-1.4 1.4-1.2-1.2-2 2V14l-2 2v5l-2-2-2 2v-5l-2-2v-2.6l-2-2-1.2 1.2-1.4-1.4 5.6-5.6 1.4 1.4-1.2 1.2 2 2h2.6l2-2-1.2-1.2 1.4-1.4z"
          fill="currentColor"
        />
      );
    case "previous":
      return (
        <>
          <path d="M7 6h2v12H7V6z" fill="currentColor" />
          <path d="M19 6L9.5 12 19 18V6z" fill="currentColor" />
        </>
      );
    case "next":
      return (
        <>
          <path d="M15 6h2v12h-2V6z" fill="currentColor" />
          <path d="M5 6l9.5 6L5 18V6z" fill="currentColor" />
        </>
      );
    case "play":
      return <path d="M9 7l10 5-10 5V7z" fill="currentColor" />;
    case "pause":
      return (
        <>
          <path d="M8 7h3v10H8V7zM13 7h3v10h-3V7z" fill="currentColor" />
        </>
      );
    case "chevronRight":
      return <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
    case "chevronLeft":
      return <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
    case "close":
      return (
        <path
          d="M7 7l10 10M17 7L7 17"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    case "overflow":
      return (
        <>
          <circle cx="6" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="18" cy="12" r="1.6" fill="currentColor" />
        </>
      );
    case "heart":
      return (
        <path
          d="M12 20s-7-4.4-9.2-8.2C1.2 9.2 2.4 6.6 5 5.6c1.9-.7 3.8-.2 5 1.2 1.2-1.4 3.1-1.9 5-1.2 2.6 1 3.8 3.6 2.2 6.2C19 15.6 12 20 12 20z"
          fill="currentColor"
        />
      );
    case "share":
      return (
        <>
          <path
            d="M10 13v-3l8-3v10l-8-3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="6" cy="8" r="2" fill="currentColor" />
          <circle cx="6" cy="16" r="2" fill="currentColor" />
        </>
      );
    case "plus":
      return (
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    case "camera":
      return (
        <>
          <path
            d="M7 7h2l1-2h4l1 2h2a3 3 0 013 3v7a3 3 0 01-3 3H7a3 3 0 01-3-3v-7a3 3 0 013-3z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="2" fill="none" />
        </>
      );
    case "plusCircle":
      return (
        <>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "mic":
      return (
        <>
          <path
            d="M12 14a3 3 0 003-3V7a3 3 0 00-6 0v4a3 3 0 003 3z"
            fill="currentColor"
          />
          <path
            d="M6.5 11.2a5.5 5.5 0 0011 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M12 16v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "ring":
      return <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />;
    case "speaker":
      return (
        <>
          <path d="M5 10h3l4-3v10l-4-3H5v-4z" fill="currentColor" />
          <path
            d="M15 9c1 .8 1.6 1.9 1.6 3S16 14.2 15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    default:
      return null;
  }
}

export function Icon({ name, size = 22, title, className }: Props) {
  const ariaLabel = title ?? name;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={ariaLabel}
      focusable="false"
    >
      <Paths name={name} />
    </svg>
  );
}

