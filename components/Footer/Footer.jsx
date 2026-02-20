import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer} aria-label="Rodapé do site">
      <div className={styles.content}>
        <p className={styles.copy}>© 2025 por Parys-boop. 2026</p>
        <nav className={styles.links} aria-label="Links de perfil">
          <a
            href="https://github.com/Parys-boop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir perfil do GitHub de Parys-boop em nova aba"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/arthur-pires-948433252/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir perfil do LinkedIn de Arthur Pires em nova aba"
          >
            LinkedIn
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
