import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

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

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
