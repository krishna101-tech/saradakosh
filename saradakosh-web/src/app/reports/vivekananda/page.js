import { getVivekanandaHierarchy } from '@/lib/db';
import VivekanandaClient from './VivekanandaClient';

export const dynamic = 'force-dynamic';

export default function VivekanandaReport() {
  const data = getVivekanandaHierarchy();

  return (
    <VivekanandaClient data={data} />
  );
}
