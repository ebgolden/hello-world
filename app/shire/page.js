import ShireGame from '@/components/ShireGame';

export const metadata = {
  title: 'The Founding of the Shire',
  description:
    'A Lord of the Rings themed tile-laying game. Draw survey tiles, fit lanes, homesteads and inns into the growing map of the young Shire, and send your hobbits out to claim the points.',
};

export default function ShirePage() {
  return <ShireGame />;
}
