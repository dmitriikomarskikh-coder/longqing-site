import type {Metadata} from 'next';
import './globals.css';
import {site} from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.names.en,
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}
