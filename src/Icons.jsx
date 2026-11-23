import React from "react";

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
const make = (children) => (props) => <svg {...base} {...props}>{children}</svg>;

export const Home = make(<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />);
export const Chat = make(<path d="M4 5h16v11H9l-5 4z" />);
export const Ticket = make(<><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="translate(0 2)" /><path d="M14 6v12" strokeDasharray="2 2" /></>);
export const Grid = make(<><rect x="3" y="3" width="7" height="7" rx="1.500" /><rect x="14" y="3" width="7" height="7" rx="1.500" /><rect x="3" y="14" width="7" height="7" rx="1.500" /><rect x="14" y="14" width="7" height="7" rx="1.500" /></>);
export const Book = make(<><path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><path d="M8 20a4 4 0 0 1-4-4M9 9h6" /></>);
export const Chart = make(<><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>);
export const Shield = make(<><path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>);
export const Logout = make(<><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" /></>);
export const Mic = make(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>);
export const Send = make(<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />);
export const Bell = make(<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" />);
export const Search = make(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>);
export const Filter = make(<path d="M4 5h16l-6 8v6l-4-2v-4z" />);
export const Chevron = make(<path d="M6 9l6 6 6-6" />);
export const Plus = make(<path d="M12 5v14M5 12h14" />);
export const Close = make(<path d="M6 6l12 12M18 6L6 18" />);
export const Smile = make(<><circle cx="12" cy="12" r="9" /><path d="M8 14a5 5 0 0 0 8 0M9 9.500h.01M15 9.500h.01" /></>);
export const UserPlus = make(<><circle cx="10" cy="8" r="3.500" /><path d="M3 20c.6-3.500 3-5 7-5M18 8v6M15 11h6" /></>);
export const Bot = make(<><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9.500 16h5" /></>);
export const Menu = make(<path d="M4 6h16M4 12h16M4 18h16" />);

export const Paperclip = make(<path d="M21 11.500l-8.500 8.500a5.500 5.500 0 0 1-7.800-7.800l8.500-8.500a3.700 3.700 0 0 1 5.200 5.200L9.900 17.400a1.800 1.800 0 0 1-2.600-2.600l7.800-7.800" />);

export const Help = make(<><circle cx="12" cy="12" r="9" /><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .900-1 1.700M12 17h.01" /></>);

export const Logo = ({ size = 36, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" {...props}>
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4f6bff" /><stop offset="1" stopColor="#12b5a6" /></linearGradient></defs>
    <rect width="64" height="64" rx="14" fill="url(#lg)" />
    <path d="M16 36v-4a16 16 0 0 1 32 0v4" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <rect x="11" y="33" width="9" height="14" rx="4" fill="#fff" /><rect x="44" y="33" width="9" height="14" rx="4" fill="#fff" />
    <path d="M48 47c0 6-5 8-13 8" fill="none" stroke="#fff" strokeWidth="3.500" strokeLinecap="round" /><circle cx="33" cy="55" r="3" fill="#fff" />
  </svg>
);
