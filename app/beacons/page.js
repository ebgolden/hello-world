import BeaconsGame from '@/components/BeaconsGame';

export const metadata = {
  title: 'The Beacon Hills',
  description:
    'A Lord of the Rings themed hidden-camp bombardment game for two. Hide five encampments among the beacon hills, scry the palantír, and burn every enemy tent before yours are found.',
};

export default function BeaconsPage() {
  return <BeaconsGame />;
}
