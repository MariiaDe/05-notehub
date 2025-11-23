import axios, { type AxiosResponse } from 'axios'
import type { Note } from '../types/note'

const api = axios.create({
  baseURL: 'https://notehub-public.goit.study/api/notes',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_NOTEHUB_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

export interface FetchNotesResponse {
  notes: Note[]
  totalPages: number
}

export const fetchNotes = async (
  page = 1,
  perPage = 12,
  search = ''
): Promise<FetchNotesResponse> => {
  const params: Record<string, string | number> = { page, perPage }
  if (search) params.search = search

  const res: AxiosResponse<FetchNotesResponse> = await api.get('', { params })
  return res.data
}

export const createNote = async (data: {
  title: string
  content: string
  tag: string
}): Promise<Note> => {
  const res: AxiosResponse<Note> = await api.post('', data)
  return res.data
}

export const deleteNote = async (id: string): Promise<Note> => {
  const res: AxiosResponse<Note> = await api.delete(`/${id}`)
  return res.data
}
