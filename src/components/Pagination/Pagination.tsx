import ReactPaginate from 'react-paginate';
import styles from './Pagination.module.css';

interface PaginationProps {
  pageCount: number;
  forcePage: number;
  onPageChange: (selected: { selected: number }) => void;
}

export default function Pagination({ pageCount, forcePage, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <ReactPaginate
      className={styles.pagination}
      pageCount={pageCount}
      forcePage={forcePage}
      onPageChange={onPageChange}
      previousLabel="Previous"
      nextLabel="Next"
      pageRangeDisplayed={5}
      marginPagesDisplayed={2}
      breakLabel="..."
    />
  );
}
