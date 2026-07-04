import { getRefsHierarchy } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Reference Archive',
  description: 'Interactive references archive for Ramakrishna-Vivekananda literature.',
  alternates: {
    canonical: 'https://www.saradakosh.org/reports/refs'
  },
  openGraph: {
    title: 'Reference Archive | Saradakosh',
    description: 'Interactive references archive for Ramakrishna-Vivekananda literature.',
    url: 'https://www.saradakosh.org/reports/refs',
  },
  twitter: {
    title: 'Reference Archive | Saradakosh',
    description: 'Interactive references archive for Ramakrishna-Vivekananda literature.',
  }
};

export default function RefsReport() {
  const data = getRefsHierarchy();
  
  return (
    <main className="max-w-5xl mx-auto px-5 md:px-8 min-h-screen">
      <Link href="/" className="mt-8 mb-6 inline-flex items-center gap-1.5 font-sans font-semibold text-text-theme opacity-80 hover:opacity-100 hover:text-primary-theme transition-all duration-300 hover:-translate-x-1 no-underline block">
        <ArrowLeft className="size-4" /> Back to Dashboard
      </Link>
      <h1 className="text-4xl font-bold mb-8 font-serif text-primary-theme">Interactive References Archive</h1>
      
      <div id="report-container">
        {Object.keys(data).map(l1 => (
          <div key={l1}>
            <h2 className="text-2xl font-bold text-primary-theme border-b-2 border-primary-theme mt-10 pb-1">
              {l1}
            </h2>
            
            {Object.keys(data[l1]).map(l2 => (
              <div key={l2}>
                <div className="text-xl font-semibold text-secondary-theme mt-5">
                  {l2}
                </div>
                
                <div className="grid grid-cols-[200px_1fr_1fr] gap-4 p-2.5 font-bold bg-warm-bg border-b border-warm-border mt-2.5 text-warm-text">
                  <div>Name</div>
                  <div>Title</div>
                  <div>Language</div>
                </div>
                
                {data[l1][l2].map(item => (
                  <div key={item.id} className="grid grid-cols-[200px_1fr_1fr] gap-4 p-2.5 border-b border-warm-border text-[0.95rem] text-text-theme">
                    <Link 
                       href={`/reports/viewer/${item.id}`}
                      className="font-semibold cursor-pointer text-primary-theme hover:underline no-underline" 
                      title="Click to view events"
                    >
                      {item.name || '-'}
                    </Link>
                    <div>{item.remark || '-'}</div>
                    <div>{item.remark2 === 'B' ? 'Bengali' : item.remark2 === 'E' ? 'English' : item.remark2 || '-'}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
