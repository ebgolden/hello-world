import PelennorGame from '@/components/PelennorGame';

export const metadata = {
  title: 'The Battle of the Pelennor',
  description:
    'A Lord of the Rings themed game of classic chess. The Free Peoples face the Host of Mordor on the chequered field — full rules, hot-seat for two players.',
};

export default function PelennorPage() {
  return <PelennorGame />;
}
