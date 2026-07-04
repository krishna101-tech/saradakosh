import { Baskervville, Noto_Sans } from "next/font/google";
import "./globals.css";

const baskervville = Baskervville({
  variable: "--font-serif",
  weight: ["400"],
  subsets: ["latin"],
});

const noto = Noto_Sans({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.saradakosh.org'),
  title: {
    default: "Saradakosh | Lives & Teachings of Sri Ramakrishna, Holy Mother, and Swami Vivekananda",
    template: "%s | Saradakosh"
  },
  description: "A comprehensive digital archive and spiritual platform dedicated to the Ramakrishna-Sarada-Vivekananda lineage. Explore life histories, original quotes, and authentic teachings.",
  keywords: ["Swami Vivekananda", "Sri Ramakrishna", "Sarada Devi", "Vedanta", "Hinduism", "Quotes", "Spiritual Teachings", "Ramakrishna Math and Mission", "Saradakosh", "Ramakrishna Paramahamsa"],
  authors: [{ name: "Saradakosh" }],
  creator: "Saradakosh",
  publisher: "Saradakosh",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Saradakosh | Spiritual Archive",
    description: "The Complete Lives & Teachings of Sri Ramakrishna, Holy Mother, and Swami Vivekananda.",
    url: "https://www.saradakosh.org",
    siteName: "Saradakosh",
    images: [
      {
        url: "/images/saradakosh_ui_og.png",
        width: 1200,
        height: 630,
        alt: "Saradakosh - Ramakrishna-Sarada-Vivekananda Lineage",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saradakosh | Spiritual Archive",
    description: "The Complete Lives & Teachings of Sri Ramakrishna, Holy Mother, and Swami Vivekananda.",
    images: ["/images/saradakosh_ui_og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        className={`${noto.variable} ${baskervville.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
