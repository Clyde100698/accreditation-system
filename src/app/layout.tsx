import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accreditation Management System",
  description: "Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University CICT",
};

const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('app-theme-id');
      var map = {
        'navy': { rgb: '0 0 247', hover: '0 0 196' },
        'emerald': { rgb: '5 150 105', hover: '4 120 87' },
        'indigo': { rgb: '79 70 229', hover: '67 56 202' },
        'crimson': { rgb: '225 29 72', hover: '190 18 60' },
        'slate': { rgb: '51 65 85', hover: '30 41 59' },
        'ocean': { rgb: '2 132 199', hover: '3 105 161' },
      };
      if (saved && map[saved]) {
        document.documentElement.style.setProperty('--color-primary', map[saved].rgb);
        document.documentElement.style.setProperty('--color-primary-hover', map[saved].hover);
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
