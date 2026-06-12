import HuntGame from '@/components/HuntGame';

export const metadata = {
  title: 'The Hunt for the Ring',
  description:
    'A Lord of the Rings themed hidden-rank strategy game for two. March forty secret pieces across the Dead Marshes, unmask enemy ranks in battle, and seize the enemy Ring.',
};

export default function HuntPage() {
  return <HuntGame />;
}
