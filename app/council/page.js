import CouncilGame from '@/components/CouncilGame';

export const metadata = {
  title: 'The Council of the Free Peoples',
  description:
    'A Lord of the Rings themed game of simultaneous secret orders. Gondor, Mordor, Rohan and Isengard pen hidden marches and supports each season, then all armies move at once — first to seven strongholds rules Middle-earth.',
};

export default function CouncilPage() {
  return <CouncilGame />;
}
