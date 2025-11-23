import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotes } from '../../services/noteService';
import type { Note } from '../../types/note';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import styles from './App.module.css';

const PER_PAGE = 12;

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const queryKey = ['notes', page, debouncedSearch];

  const { data: notesData, isLoading, error } = useQuery<FetchNotesResponse, Error>({
    queryKey,
    queryFn: () => fetchNotes(page, PER_PAGE, debouncedSearch),
    placeholderData: queryClient.getQueryData<FetchNotesResponse>([
      'notes',
      page - 1,
      debouncedSearch,
    ]),
    staleTime: 5000,
  });

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
  if (error) return <div className={styles.error}>Помилка: {error.message}</div>;

  const notes = notesData?.notes ?? [];
  const totalPages = notesData?.totalPages ?? 1;

  return (
    <div className={styles.app}>
      <header className={styles.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />

        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            forcePage={page - 1}
            onPageChange={({ selected }) => setPage(selected + 1)}
          />
        )}

        <button className={styles.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {notes.length > 0 ? (
        <NoteList notes={notes} />
      ) : (
        <div className={styles.empty}>No notes yet. Create your first one!</div>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
