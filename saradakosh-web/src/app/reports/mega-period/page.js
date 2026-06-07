import { getMegaPeriods } from '@/lib/db';
import MegaPeriodClient from './MegaPeriodClient';

export const dynamic = 'force-dynamic';

export default function MegaPeriodReport() {
  const data = getMegaPeriods();

  return (
    <MegaPeriodClient data={data} />
  );
}
