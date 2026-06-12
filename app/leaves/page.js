import LeavesGame from '@/components/LeavesGame';

export const metadata = {
  title: 'The Leaves of Lórien',
  description:
    'A Lord of the Rings themed deck-building card game for 1-4 hot-seat players. Build a hoard of treasures, raid your rivals, and claim Realms before the supply runs dry.',
};

export default function LeavesPage() {
  return <LeavesGame />;
}
