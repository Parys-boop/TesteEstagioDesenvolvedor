'use client';

import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './SearchHeader.module.css';

const SearchHeader = ({ value, onSearch, isLoading }) => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <SearchBar value={value} onSearch={onSearch} isLoading={isLoading} />
      </div>
    </header>
  );
};

export default SearchHeader;
