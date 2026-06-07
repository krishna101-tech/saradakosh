import { getRefsHierarchy } from '@/lib/db';
import Link from 'next/link';

export default function RefsReport() {
  const data = getRefsHierarchy();
  
  return (
    <div className="container min-h-screen">
      <Link href="/" className="back-link mt-8 block">
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-4xl font-bold mb-8 font-serif text-[#d35400]">Interactive References Archive</h1>
      
      <div id="report-container">
        {Object.keys(data).map(l1 => (
          <div key={l1}>
            <h2 className="level1-title" style={{ color: 'var(--primary-color)', borderBottom: '2px solid var(--primary-color)', marginTop: '40px', paddingBottom: '5px', fontSize: '1.5rem', fontWeight: 700 }}>
              {l1}
            </h2>
            
            {Object.keys(data[l1]).map(l2 => (
              <div key={l2}>
                <div className="level2-title" style={{ color: 'var(--secondary-color)', fontSize: '1.2rem', marginTop: '20px', fontWeight: 600 }}>
                  {l2}
                </div>
                
                <div className="ref-header" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '15px', padding: '10px', fontWeight: 'bold', background: '#fff8f0', borderBottom: '1px solid #ccc', marginTop: '10px', color: '#2c2520' }}>
                  <div>Name</div>
                  <div>Remark 1</div>
                  <div>Remark 2</div>
                </div>
                
                {data[l1][l2].map(item => (
                  <div key={item.id} className="ref-item" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '15px', padding: '10px', borderBottom: '1px solid #eed', fontSize: '0.95rem', color: 'var(--text-color)' }}>
                    <Link 
                      href={`/reports/viewer/${item.id}`}
                      className="clickable-name" 
                      style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-color)' }} 
                      title="Click to view events"
                    >
                      {item.name || '-'}
                    </Link>
                    <div>{item.remark || '-'}</div>
                    <div>{item.remark2 || '-'}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
