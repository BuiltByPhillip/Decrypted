import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Noto_Sans_Math } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import SmoothScroll from "~/components/SmoothScroll";
import Logo from "~/app/_components/logo";

export const metadata: Metadata = {
  title: "Decrypted",
  description: "A cryptographic protocol exercise generator",
  icons: {
    icon: "/Logo Decrypted.svg",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const notoMath = Noto_Sans_Math({
  weight: "400",
  subsets: ["math"],
  variable: "--font-noto-math",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${notoMath.variable}`}>
      <body>
        <header className="absolute top-0 left-0 z-10 flex w-full items-center px-4 py-3 lg:px-8 lg:py-4 xl:px-32">
          {/*<Logo className="h-30 w-30 shrink-0" /> */}
          <div className="flex flex-1 justify-center">
            <a href="/code" className="pointer-events-auto z-10">
              <span className="logo-shimmer text-3xl font-extrabold tracking-wide uppercase lg:text-4xl">
                decrypted
              </span>
            </a>
          </div>
          <div className="w-12 shrink-0" />
        </header>
        <SmoothScroll>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
