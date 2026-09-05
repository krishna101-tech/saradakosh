import QuizClient from './QuizClient';

export const metadata = {
  title: 'Saradakosh Quiz | Canonical Multi-Language Quiz',
  description: 'Test your knowledge on the sacred lives and timeless teachings of Sri Ramakrishna, Sri Sarada Devi, and Swami Vivekananda.',
  alternates: {
    canonical: '/quiz',
  },
  openGraph: {
    title: 'Saradakosh Quiz | Spiritual Knowledge',
    description: 'Explore the teachings and lives of Sri Ramakrishna, Holy Mother, and Swami Vivekananda.',
    url: 'https://www.saradakosh.org/quiz',
  },
};

export default function QuizPage() {
  return <QuizClient />;
}
