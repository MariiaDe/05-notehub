import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, createNote, deleteNote } from '../../services/noteService';
import type { Note } from '../../types/note';
import NoteList, { type NoteListProps } from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import NoteForm, { type NoteFormProps } from '../NoteForm/NoteForm';
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
  const queryKey = ['notes', page, debouncedSearch];

  const { data: notesData, isLoading, error } = useQuery<FetchNotesResponse, Error>({
    queryKey,
    queryFn: () => fetchNotes(page, PER_PAGE, debouncedSearch),
    placeholderData: queryClient.getQueryData<FetchNotesResponse>(['notes', page - 1, debouncedSearch]),
    staleTime: 5000,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'], exact: false });
      setIsModalOpen(false);
      setPage(1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'], exact: false });
    },
  });

  const handleCreate: NoteFormProps['onSubmit'] = (values) => {
    createMutation.mutate(values);
  };

  const handleDelete: NoteListProps['onDelete'] = (id) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
  if (error) return <div className={styles.error}>Помилка: {error.message}</div>;

  const notes: Note[] = notesData?.notes ?? [];
  const totalPages: number = notesData?.totalPages ?? 1;

  return (
    <div className={styles.app}>
      <header className={styles.toolbar}>
        <SearchBox value={search} onChange={setSearch} />
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
        <NoteList notes={notes} onDelete={handleDelete} />
      ) : (
        <div className={styles.empty}>No notes yet. Create your first one!</div>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
