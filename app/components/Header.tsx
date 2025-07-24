import Link from "next/link";
import Logo from "./Logo";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.brandLink} aria-label="Home">
          <Logo width={120} height={120} />
          <span className={styles.brandText}>Agentic AI</span>
        </Link>
      </div>
      <nav className={styles.nav} aria-label="Main Navigation">
        <Link href="/" className={styles.navLink}>Home</Link>
        <Link href="/chat" className={styles.navLink}>Chat</Link>
        <Link href="/#features" className={styles.navLink}>Features</Link>
        <Link href="/#how-it-works" className={styles.navLink}>Approach</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/contact" className={styles.navLink}>Contact</Link>
        <Link href="/login" className={styles.loginLink}>Login</Link>
      </nav>
    </header>
  );
}
