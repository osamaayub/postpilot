// Small inline icon set (24px grid, stroke-based) so the UI needs no icon dependency.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function make(paths: React.ReactNode, displayName: string) {
  const Icon = ({ size = 16, ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {paths}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const SparkIcon = make(<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />, "SparkIcon");
export const PenIcon = make(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></>, "PenIcon");
export const ListIcon = make(<><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>, "ListIcon");
export const CopyIcon = make(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" /></>, "CopyIcon");
export const RefreshIcon = make(<><path d="M21 12a9 9 0 01-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0115.5-6.2L21 8" /><path d="M21 3v5h-5M3 21v-5h5" /></>, "RefreshIcon");
export const TrashIcon = make(<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>, "TrashIcon");
export const CheckIcon = make(<path d="M20 6L9 17l-5-5" />, "CheckIcon");
export const StopIcon = make(<rect x="6" y="6" width="12" height="12" rx="2" />, "StopIcon");
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>, "SearchIcon");
export const ArrowRightIcon = make(<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>, "ArrowRightIcon");
export const LogoutIcon = make(<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>, "LogoutIcon");
export const EyeIcon = make(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>, "EyeIcon");
export const EyeOffIcon = make(<><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 005.4-1.6" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></>, "EyeOffIcon");
export const BoltIcon = make(<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />, "BoltIcon");
export const ShieldIcon = make(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>, "ShieldIcon");
export const GaugeIcon = make(<><path d="M12 14l4-4" /><path d="M3.3 17a9 9 0 1117.4 0" /></>, "GaugeIcon");
export const UndoIcon = make(<><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 010 11H11" /></>, "UndoIcon");
export const FoldIcon = make(<><path d="M3 6h18M3 12h12M3 18h7" /><path d="M17 15l3 3-3 3" /></>, "FoldIcon");
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>, "UserIcon");
export const CodeIcon = make(<><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></>, "CodeIcon");
export const GitHubIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 .5a11.5 11.5 0 00-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 015.8 0C17.3 4.3 18.3 4.6 18.3 4.6c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0012 .5z" />
  </svg>
);
// Decorative, for the LinkedIn-style preview footer.
export const LikeIcon = make(<path d="M7 10v11H3V10h4zm0 0l4-8a2.5 2.5 0 012.5 2.5V9h5.6a2 2 0 012 2.3l-1.4 8A2 2 0 0117.7 21H7" />, "LikeIcon");
export const CommentIcon = make(<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />, "CommentIcon");
export const RepostIcon = make(<><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 01-3 3H3" /></>, "RepostIcon");
export const SendIcon = make(<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />, "SendIcon");
