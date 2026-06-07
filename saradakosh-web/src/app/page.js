import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';
import TodayInHistory from '@/components/TodayInHistory';
import SearchBar from '@/components/SearchBar';
import ClassSchedule from '@/components/ClassSchedule';

export default function Home() {
  return (
    <>
      <header className="hero">
        <ThemeSelector />
        <div className="hero-content">
          <h1>Saradakosh</h1>
          <h2 className="subtitle" style={{ display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4', marginBottom: '40px' }}>
            <span>The Lives, Teachings, and Legacy of Sri Ramakrishna, Sri Sarada Devi, and Swami Vivekananda</span>
            <span style={{ fontSize: '0.85em', opacity: 0.9 }}>A Historical and Spiritual Journey Through the First Century of the Ramakrishna Movement</span>
            <span style={{ fontSize: '0.8em', opacity: 0.7, letterSpacing: '2px' }}>1836–1936</span>
          </h2>
          
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <a href="https://notebooklm.google.com/notebook/e341fff6-3ed6-483c-a6e7-733e9bdbacd4" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', fontSize: '1.1rem', padding: '12px 24px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
              ✨ Ask AI
            </a>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.9, maxWidth: '500px', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
              Click to chat with an interactive AI trained on the core literature of Sri Ramakrishna, Ma Sarada, and Swami Vivekananda.
            </p>
          </div>
          
          <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto 20px auto', textAlign: 'left' }}>
            <div style={{ marginBottom: '10px', paddingLeft: '20px', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8 }}>
              Browse Local Archive
            </div>
            <SearchBar />
          </div>
        </div>
      </header>

      <div className="container">
        {/* Reports */}
        <h2 className="section-title">Reports & Directories</h2>
        <div className="reports-grid">
          <Link href="/reports/refs" className="report-card">
            <h3>Book References</h3>
            <p>A hierarchical view of references, nested by category.</p>
          </Link>
          <Link href="/reports/vivekananda" className="report-card">
            <h3>Swami Vivekananda</h3>
            <p>Interactive tree exploring the life and works of Swami Vivekananda.</p>
          </Link>
          <Link href="/reports/mega-period" className="report-card">
            <h3>Major Periods of our History</h3>
            <p>Explore the major historical eras of the movement.</p>
          </Link>
        </div>

        {/* Schedule */}
        <ClassSchedule />

        {/* Today in History */}
        <div style={{ marginTop: '50px' }}>
          <TodayInHistory />
        </div>

        <footer className="site-footer">
          <h3 className="footer-title">Swami Vivekananda Quotes</h3>
          <div className="quotes-grid">
            <div className="quote-category">
              <h4>On Self-Belief</h4>
              <blockquote>"You cannot believe in God until you believe in yourself."</blockquote>
              <blockquote>"Stand up, be bold, be strong. Take the whole responsibility on your own shoulders, and know that you are the creator of your own destiny."</blockquote>
              <blockquote>"He is an atheist who does not believe in himself."</blockquote>
            </div>
            <div className="quote-category">
              <h4>On Strength and Courage</h4>
              <blockquote>"The greatest sin is to think that you are weak."</blockquote>
              <blockquote>"Arise, awake, and stop not until the goal is reached."</blockquote>
              <blockquote>"Take up one idea. Make that one idea your life..."</blockquote>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
