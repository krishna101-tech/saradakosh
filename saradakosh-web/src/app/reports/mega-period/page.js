import { getMegaPeriods } from '@/lib/db';
import MegaPeriodClient from './MegaPeriodClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Historical Periods | Saradakosh',
  description: 'Main periods in the history of the Ramakrishna Movement.',
  alternates: {
    canonical: 'https://saradakosh.org/reports/mega-period'
  }
};

export default function MegaPeriodReport() {
  const data = getMegaPeriods();

  return (
    <MegaPeriodClient data={data} />
  );
}
