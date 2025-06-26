import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next'; 

// if the children have metadata, it will override the parent 

export const metadata: Metadata = {
  title: {
    template: '%s | Creston Dashboard',
    default: 'Creston Dashboard',
  },
  description: 'Create your invoice hassle free',
  metadataBase: new URL('https://nextjs-dashboard-latest-seven.vercel.app/dashboard'),
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
          <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}