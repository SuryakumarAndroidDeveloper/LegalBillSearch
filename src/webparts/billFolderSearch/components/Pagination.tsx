import * as React from 'react';
import styles from './Pagination.module.scss';

interface Props {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  paginate: (pageNumber: number) => void;
}

const Pagination: React.FC<Props> = ({
  itemsPerPage,
  totalItems,
  currentPage,
  paginate
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];

  // Optional: Limit visible page numbers (e.g., 5 max at once)
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className={styles.pagination}>
      <button
        className={styles.navButton}
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      >
        First
      </button>

      <button
        className={styles.navButton}
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => paginate(num)}
          className={`${styles.pageButton} ${num === currentPage ? styles.active : ''}`}
        >
          {num}
        </button>
      ))}

      <button
        className={styles.navButton}
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      <button
        className={styles.navButton}
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </nav>
  );
};

export default Pagination;
