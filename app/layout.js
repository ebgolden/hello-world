import './globals.css';

export const metadata = {
  title: 'Settlers of Middle-earth',
  description:
    'A Lord of the Rings themed settlement-building strategy game. Gather Timber, Clay, Fleece, Grain and Mithril, beware the Nazgûl, and unite Middle-earth.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
