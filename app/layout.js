import { Cinzel, IM_Fell_English } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
});

const fell = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-fell',
});

export const metadata = {
  title: 'Settlers of Middle-earth',
  description:
    'A Lord of the Rings themed settlement-building strategy game. Gather Timber, Clay, Fleece, Grain and Mithril, beware the Nazgûl, and unite Middle-earth.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fell.variable} ${cinzel.variable}`}>{children}</body>
    </html>
  );
}
