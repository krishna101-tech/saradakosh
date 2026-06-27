import { getVivekanandaHierarchy } from '@/lib/db';
import VivekanandaClient from './VivekanandaClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Swami Vivekananda Timeline | Saradakosh',
  description: 'Explore the complete life and teachings of Swami Vivekananda (1863-1902).',
  alternates: {
    canonical: 'https://saradakosh.org/reports/vivekananda'
  }
};

export default function VivekanandaReport() {
  const data = getVivekanandaHierarchy();

  return (
    <VivekanandaClient data={data} />
  );
}
