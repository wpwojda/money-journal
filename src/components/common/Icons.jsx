function Icon({ children, size = 16, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <Icon {...props} strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconClose(props) {
  return (
    <Icon {...props} strokeWidth="2.5">
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function IconChevron({ dir = "left", size = 18 }) {
  const paths = {
    left: "M15 18l-6-6 6-6",
    right: "M9 18l6-6-6-6",
    up: "M18 15l-6-6-6 6",
    down: "M6 9l6 6 6-6",
  };
  return (
    <Icon size={size} strokeWidth="2.2">
      <path d={paths[dir]} />
    </Icon>
  );
}

export function IconSettings(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Icon>
  );
}

export function IconSearch(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Icon>
  );
}

export function IconTrash(props) {
  return (
    <Icon {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
    </Icon>
  );
}

export function IconDownload(props) {
  return (
    <Icon {...props}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
    </Icon>
  );
}

export function IconUpload(props) {
  return (
    <Icon {...props}>
      <path d="M12 21V9m0 0l-4 4m4-4l4 4M4 5h16" />
    </Icon>
  );
}

export function IconRepeat(props) {
  return (
    <Icon {...props}>
      <path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
    </Icon>
  );
}

export function IconWallet(props) {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <path d="M16 12h3" />
      <path d="M3 9h18" />
    </Icon>
  );
}

export function IconEdit(props) {
  return (
    <Icon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </Icon>
  );
}

/** Small monochrome glyph per expense category, used next to the color dot everywhere. */
export function CategoryIcon({ category, size = 14 }) {
  switch (category) {
    case "Food":
      return (
        <Icon size={size}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
        </Icon>
      );
    case "Groceries":
      return (
        <Icon size={size}>
          <path d="M4 9h16l-1.5 10.2a2 2 0 01-2 1.8H7.5a2 2 0 01-2-1.8L4 9z" />
          <path d="M8 9V7a4 4 0 018 0v2" />
        </Icon>
      );
    case "Transport":
      return (
        <Icon size={size}>
          <rect x="3" y="11" width="18" height="6" rx="2" />
          <circle cx="7.5" cy="19" r="1.5" />
          <circle cx="16.5" cy="19" r="1.5" />
        </Icon>
      );
    case "Rent":
      return (
        <Icon size={size}>
          <path d="M4 11l8-7 8 7" />
          <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
        </Icon>
      );
    case "Bills":
      return (
        <Icon size={size}>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
        </Icon>
      );
    case "Shopping":
      return (
        <Icon size={size}>
          <path d="M6 8h12l-1 12H7L6 8z" />
          <path d="M9 8V6a3 3 0 016 0v2" />
        </Icon>
      );
    case "Entertainment":
      return (
        <Icon size={size}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 9l5 3-5 3V9z" />
        </Icon>
      );
    case "Health":
      return (
        <Icon size={size}>
          <path d="M12 20s-7-4.5-9.3-9A5 5 0 0112 6a5 5 0 019.3 5c-2.3 4.5-9.3 9-9.3 9z" />
        </Icon>
      );
    case "Education":
      return (
        <Icon size={size}>
          <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" />
          <path d="M4 18.5A2.5 2.5 0 016.5 16H20" />
        </Icon>
      );
    default:
      return (
        <Icon size={size}>
          <circle cx="6" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="18" cy="12" r="1.4" />
        </Icon>
      );
  }
}
