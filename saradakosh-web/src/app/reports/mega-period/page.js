import { getMegaPeriods } from '@/lib/db';
import MegaPeriodClient from './MegaPeriodClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Historical Periods',
  description: 'Main periods in the history of the Ramakrishna Movement.',
  alternates: {
    canonical: 'https://saradakosh.org/reports/mega-period'
  },
  openGraph: {
    title: 'Historical Periods | Saradakosh',
    description: 'Main periods in the history of the Ramakrishna Movement.',
    url: 'https://saradakosh.org/reports/mega-period',
  },
  twitter: {
    title: 'Historical Periods | Saradakosh',
    description: 'Main periods in the history of the Ramakrishna Movement.',
  }
};

export default function MegaPeriodReport() {
  const data = getMegaPeriods();

  return (
    <MegaPeriodClient data={data} />
  );
}
