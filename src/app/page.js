import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>


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
            textAlign: 'center'
          }}>
            <h2 style={{ fontWeight: 600, marginBottom: '0.7rem' }}>Admin Dashboard</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.5 }}>
              Access all user Excel sheets (Admin access required)
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
