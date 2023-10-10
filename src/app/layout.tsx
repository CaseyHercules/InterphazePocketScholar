import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter, Gentium_Book_Plus } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

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
        "bg-white text-stone-900 antialias",
        inter.className,
        gbp.className
      )}
    >
      <body className="min-h-screen pt-12 bg-background antialiased">
        <Providers>
          {/* @ts-expect-error server compenent */}
          <Navbar />
          {authModal}
          <div className="container max-w-7xl mx-auto h-full pt-4 md:pt-2">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
