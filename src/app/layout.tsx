import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter, Gentium_Book_Plus } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Providers from "./providers";

export const metadata = {
  title: "Interphaze Pocket Scholar",
  description: "Tutorial for project, soon to be a web app.",
};

const inter = Inter({ subsets: ["latin"] });
const gbp = Gentium_Book_Plus({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
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
        gbp.className
      )}
    >
      <body className="min-h-screen bg-background antialiased flex flex-col">
        <Providers>
          {/* Fixed navbar at the top */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </div>

          {/* Auth modal */}
          {authModal}

          {/* Main content area with proper padding for fixed header */}
          <main className="flex-1 container max-w-7xl mx-auto pt-16 pb-8 px-4">
            <div className="h-full">{children}</div>
          </main>

          {/* Toast notifications */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
