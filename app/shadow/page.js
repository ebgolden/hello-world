import ShadowGame from '@/components/ShadowGame';

export const metadata = {
  title: 'The Shadow Spreads',
  description:
    'A Lord of the Rings themed cooperative strategy game. Race across 24 lands of Middle-earth to cleanse spreading corruption and banish the four Shadow fronts at their Havens before darkness wins.',
};

export default function ShadowPage() {
  return <ShadowGame />;
}
