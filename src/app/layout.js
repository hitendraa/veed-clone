import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';
import { Electrolize } from 'next/font/google';
import localFont from 'next/font/local';
import { UserDetailContextProvider } from "./context/UserDetailContext";

const electrolize = Electrolize({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const baseNeueBlack = localFont({
  src: 'fonts/BaseNeueTrial-Black.ttf',
  display: 'swap',
});

export const metadata = {
  title: 'My Mantine app',
  description: 'I have followed setup instructions carefully',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" {...mantineHtmlProps} className={electrolize.className}>
        <head>
          <ColorSchemeScript />
        </head>
        <body className="bg-[#ECEEEE]">
          <MantineProvider theme={{ fontFamily: electrolize.style.fontFamily }}>
            <UserDetailContextProvider>
              {children}
            </UserDetailContextProvider>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
