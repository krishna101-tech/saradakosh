import { Inter, Merriweather, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "Saradakosh Next.js",
  description: "Dynamically generated web application for Saradakosh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('saradakosh-theme') || 'system';
                let isDark = false;
                if (theme === 'system') {
                  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                } else {
                  isDark = (theme === 'dark');
                }
                if (isDark) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
