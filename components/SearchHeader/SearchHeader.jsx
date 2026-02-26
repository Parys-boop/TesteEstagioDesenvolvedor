'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './SearchHeader.module.css';

const SearchHeader = ({ value, onSearch, isLoading }) => {
  const { status } = useSession();
  const showAuthActions = status !== 'authenticated';

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.spacer} aria-hidden="true" />
        <div className={styles.searchSlot}>
          <SearchBar value={value} onSearch={onSearch} isLoading={isLoading} />
        </div>
        <div className={styles.authActions}>
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
