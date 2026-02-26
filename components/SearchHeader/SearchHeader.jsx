'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './SearchHeader.module.css';

const SearchHeader = ({ value, onSearch, isLoading }) => {
  const { usuario, carregando } = useAuth();
  const showAuthActions = !carregando && !usuario;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.authActions}>
          {showAuthActions && (
            <>
              <Link className={styles.authButton} href="/login">
                Entrar
              </Link>
              <Link className={styles.authButton} href="/cadastro">
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <div className={styles.searchSlot}>
          <SearchBar value={value} onSearch={onSearch} isLoading={isLoading} />
        </div>

        <div className={styles.spacer} aria-hidden="true" />
      </div>
    </header>
  );
};

export default SearchHeader;
