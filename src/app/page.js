import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'var(--foreground)' }}>🗳️ Inocental Voter Data Extractor</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Digitize voter registration forms quickly and efficiently with advanced OCR technology
          </p>
        </div>

        <div style={{ margin: '20px 0' }}>
          <Link href="/voter-data-extractor" style={{
            padding: '1.5rem 1.8rem',
            borderRadius: '12px',
            background: 'rgba(var(--card-rgb), 0)',
            border: '1px solid rgba(var(--card-border-rgb), 0.15)',
            transition: 'background 200ms, border 200ms',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontWeight: 600, marginBottom: '0.7rem' }}>Voter Data Extractor</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.5 }}>
              Create Excel sheets, capture voter forms, and extract data automatically
            </p>
          </Link>
          
          <Link href="/admin-dashboard" style={{
            padding: '1.5rem 1.8rem',
            borderRadius: '12px',
            background: 'rgba(var(--card-rgb), 0)',
            border: '1px solid rgba(var(--card-border-rgb), 0.15)',
            transition: 'background 200ms, border 200ms',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontWeight: 600, marginBottom: '0.7rem' }}>Admin Dashboard</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.5 }}>
              Access all user Excel sheets (Admin access required)
            </p>
          </Link>
          
          <Link href="/user-guide.html" target="_blank" style={{
            padding: '1.5rem 1.8rem',
            borderRadius: '12px',
            background: 'rgba(var(--card-rgb), 0)',
            border: '1px solid rgba(var(--card-border-rgb), 0.15)',
            transition: 'background 200ms, border 200ms',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center'
          }}>
            <h2 style={{ fontWeight: 600, marginBottom: '0.7rem' }}>📖 User Guide</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.5 }}>
              Comprehensive documentation and instructions for using the application
            </p>
          </Link>
        </div>

    
      </main>
      <footer className={styles.footer}>
    @Inclusion
      </footer>
    </div>
  );
}
