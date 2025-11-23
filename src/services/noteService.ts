import axios, { type AxiosResponse } from 'axios';
import type { Note } from '../types/note';

const api = axios.create({
  baseURL: 'https://notehub-public.goit.study/api/notes',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_NOTEHUB_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface FetchNotesResponse {
  data: Note[];
  totalPages: number;
  currentPage: number;
  totalNotes: number;
}

type CreateNotePayload = {
  title: string;
  content: string;
  tag: { name: Note['tag'] };
};

export const fetchNotes = async (
  page = 1,
  perPage = 12,
  search = ''
): Promise<FetchNotesResponse> => {
  const params: Record<string, string | number> = { page, perPage };
  if (search) params.search = search;

  const response: AxiosResponse<FetchNotesResponse> = await api.get('', { params });
  return response.data;
};

export const createNote = async (data: {
  title: string;
  content: string;
  tag: Note['tag'];
}): Promise<Note> => {
  const payload: CreateNotePayload = {
    title: data.title,
    content: data.content,
    tag: { name: data.tag }, 
  };

  const response: AxiosResponse<Note> = await api.post('', payload);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.delete(`/${id}`);
  return response.data;
};