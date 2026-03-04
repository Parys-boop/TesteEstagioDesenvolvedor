'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar/SearchBar';
import useRequireAuth from '@/hooks/useRequireAuth';
import styles from './SearchHeader.module.css';

const SearchHeader = ({ value, onSearch, isLoading }) => {
  const router = useRouter();
  const { requireAuth, status, isAuthenticated } = useRequireAuth();
  const showAuthActions = !isAuthenticated;
  const isCheckingAuth = status === 'loading';

  const handleMeusEventosClick = async () => {
    await requireAuth(() => {
      router.push('/eventos/historico');
    });
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.spacer} aria-hidden="true" />
        <div className={styles.searchSlot}>
          <SearchBar value={value} onSearch={onSearch} isLoading={isLoading} />
        </div>
        <div className={styles.authActions}>
          <button
            type="button"
            className={styles.eventsButton}
            onClick={handleMeusEventosClick}
            disabled={isCheckingAuth}
          >
            Meus Eventos
          </button>
          {showAuthActions && (
            <>
              <Link className={styles.authButton} href="/auth/login">
                Entrar
              </Link>
              <Link className={styles.authButton} href="/auth/cadastro">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;
