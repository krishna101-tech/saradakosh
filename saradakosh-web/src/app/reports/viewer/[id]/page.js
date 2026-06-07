import { getEventsByParameterId } from '@/lib/db';
import ViewerAccordion from '@/components/ViewerAccordion';
import BackButton from '@/components/BackButton';

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

  return (
    <div className="container min-h-screen p-8" style={{ maxWidth: '1200px' }}>
      <BackButton />
      
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
    </div>
  );
}
