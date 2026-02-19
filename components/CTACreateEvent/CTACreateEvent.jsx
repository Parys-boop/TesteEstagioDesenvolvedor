'use client';

import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';
import styles from './CTACreateEvent.module.css';

const CTACreateEvent = () => {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();

  const handleCreateEvent = async () => {
    await requireAuth(() => {
      router.push('/eventos/criar');
    });
  };

  return (
    <section className={styles.section} id="cta-create-event" aria-label="Criar evento">
      <div className={styles.card}>
        <h2>Pronto para criar seu evento?</h2>
        <p>
          Encontre o artista ideal e organize todos os detalhes em poucos passos.
        </p>
        <button type="button" className={styles.button} onClick={handleCreateEvent}>
          Criar evento
        </button>
      </div>
    </section>
  );
};

export default CTACreateEvent;
