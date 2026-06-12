import JourneysGame from '@/components/JourneysGame';

export const metadata = {
  title: 'There and Back Again',
  description:
    'A Lord of the Rings themed route-building game. Collect pony cards, claim the roads between twenty places in Middle-earth, and complete secret journeys before the stables run dry.',
};

export default function JourneysPage() {
  return <JourneysGame />;
}
