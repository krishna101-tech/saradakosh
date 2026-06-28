import { getEventsByParameterId } from '@/lib/db';
import ViewerAccordion from '@/components/ViewerAccordion';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { parameter } = getEventsByParameterId(parseInt(id, 10));
  if (!parameter) return {};
  
  return {
    title: `${parameter.para1} — Swami Vivekananda Timeline`,
    alternates: {
      canonical: `https://www.saradakosh.org/reports/viewer/${id}`,
    },
    openGraph: {
      title: `${parameter.para1} — Swami Vivekananda Timeline | Saradakosh`,
      url: `https://www.saradakosh.org/reports/viewer/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${parameter.para1} — Swami Vivekananda Timeline | Saradakosh`,
    }
  };
}

export default async function ViewerPage({ params }) {
  const { id } = await params;
  const { parameter, events } = getEventsByParameterId(parseInt(id, 10));

  if (!parameter) {
    return (
      <div className="container min-h-screen p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mt-8">Record Not Found</h1>
      </div>
    );
  }

  // Determine parent page based on parameter type
  const type = parameter.type;
  let parentLabel = 'Reports';
  let parentUrl = '/';
  if (type === 'Ref') {
    parentLabel = 'Reference Archive';
    parentUrl = '/reports/refs';
  } else if (type && type.startsWith('Period')) {
    parentLabel = 'Vivekananda Timeline';
    parentUrl = '/reports/vivekananda';
  } else if (type && type.startsWith('Place')) {
    parentLabel = 'Places Directory';
    parentUrl = '/reports/places';
  } else if (type === 'Person') {
    parentLabel = 'Persons Directory';
    parentUrl = '/reports/persons';
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.saradakosh.org"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": parentLabel,
        "item": `https://www.saradakosh.org${parentUrl}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": parameter.para1,
        "item": `https://www.saradakosh.org/reports/viewer/${id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container min-h-screen p-8" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <BackButton />
          <nav className="text-xs sm:text-sm font-sans flex items-center space-x-1 sm:space-x-2 text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href={parentUrl} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{parentLabel}</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[150px] sm:max-w-[300px]" aria-current="page">{parameter.para1}</span>
          </nav>
        </div>
        
        <h2 className="title" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
          {parameter.para1}
        </h2>
        
        <h3 style={{ textAlign: 'center', color: 'var(--secondary-color)', fontWeight: 300, marginTop: '-20px', marginBottom: '30px' }}>
          Total Records Found: {events.length}
        </h3>
        
        {events.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No text records found for this parameter.</p>
        ) : (
          <ViewerAccordion events={events} />
        )}

        <div className="mt-12 pt-6 border-t border-glass-border text-center">
          <Link 
            href={`/about?ref=${encodeURIComponent(`/reports/viewer/${id}`)}&type=correction`}
            className="text-xs text-gray-500 hover:text-amber-600 hover:underline transition-colors font-sans"
          >
            ✏️ Suggest a correction
          </Link>
        </div>
      </main>
    </>
  );
}
