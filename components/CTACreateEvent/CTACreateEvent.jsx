'use client';

import Link from 'next/link';
import styles from './CTACreateEvent.module.css';

const CTACreateEvent = () => {
  return (
    <section className={styles.section} id="cta-create-event" aria-label="Criar evento">
      <div className={styles.card}>
        <h2>Pronto para criar seu evento?</h2>
        <p>
          Encontre o artista ideal e organize todos os detalhes em poucos passos.
        </p>
        <Link href="/criar-evento" className={styles.button}>
          Criar evento
        </Link>
      </div>
    </section>
  );
};

export default CTACreateEvent;
