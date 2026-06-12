import RiskGame from '@/components/RiskGame';

export const metadata = {
  title: 'The War of the Ring',
  description:
    'A Lord of the Rings themed world-conquest strategy game. Muster armies across 36 territories of Middle-earth, hold whole realms, and drive your rivals into the sea.',
};

export default function WarPage() {
  return <RiskGame />;
}
