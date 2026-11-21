import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import "@fontsource-variable/source-serif-4";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PostPilot: LinkedIn posts people read", template: "%s · PostPilot" },
  description: "Turn an idea into a LinkedIn post with a strong hook. Built with Next.js 16, PostgreSQL and the OpenAI Responses API.",
};

export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f7f7f9" }, { media: "(prefers-color-scheme: dark)", color: "#0a0b10" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <Toaster position="bottom-center" theme="system" richColors closeButton mobileOffset={{ bottom: 96 }} toastOptions={{ style: { borderRadius: "14px" } }} />
      </body>
    </html>
  );
}
