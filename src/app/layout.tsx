import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter, Gentium_Book_Plus } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Interphaze Pocket Scholar",
  description: "Learn, Register, and Adapt to the lands of Interphaze.",
  metadataBase: new URL("https://interphaze-pocket-scholar.vercel.app"),
  openGraph: {
    title: "Interphaze Pocket Scholar",
    description: "Learn, Register, and Adapt to the lands of Interphaze.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.svg",
        width: 262,
        height: 184,
        alt: "Interphaze Pocket Scholar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interphaze Pocket Scholar",
    description: "Learn, Register, and Adapt to the lands of Interphaze.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

const inter = Inter({ subsets: ["latin"] });
const gbp = Gentium_Book_Plus({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-gentium-book-plus",
});

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-stone-900 antialias light",
        inter.className,
        gbp.className,
        gbp.variable
      )}
    >
      <body
        className="min-h-screen antialiased flex flex-col aesthetic-bg"
        suppressHydrationWarning
      >
        <Analytics />
        <Providers>
          {/* Fixed navbar at the top */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
            <Navbar />
          </div>

          {/* Auth modal */}
          {authModal}

          {/* Main content area with proper padding for fixed header */}
          <main className="flex-1 w-[96%] mx-auto pt-16 pb-8">
            <div className="h-full glass-container content-container smooth-transition enhanced-text">
              {children}
            </div>
          </main>

          {/* Toast notifications */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
