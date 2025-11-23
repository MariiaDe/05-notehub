import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '../../services/noteService';
import styles from './NoteForm.module.css';

export type NoteTag = 'Todo' | 'Work' | 'Personal' | 'Meeting' | 'Shopping';
const ALLOWED_TAGS: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

export interface NoteFormProps {
  onCancel: () => void;
}

type FormValues = {
  title: string;
  content: string; 
  tag: NoteTag;
};

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must not exceed 50 characters')
    .required('Title is required'),
  content: Yup.string().max(500, 'Content must not exceed 500 characters'),
  tag: Yup.mixed<NoteTag>().oneOf(ALLOWED_TAGS, 'Please select a valid tag').required('Tag is required'),
});

export default function NoteForm({ onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createNote({
        title: values.title,
        content: values.content,
        tag: values.tag,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onCancel();
    },
    onError: (err) => {
      console.error('Create note error:', err);
      alert('Не вдалося створити нотатку. Перевірте консоль.');
    },
  });

  return (
    <Formik<FormValues>
      initialValues={{ title: '', content: '', tag: 'Todo' }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        mutation.mutate(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" type="text" className={styles.input} autoFocus />
            <ErrorMessage name="title" component="span" className={styles.error} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <Field as="textarea" id="content" name="content" rows={8} className={styles.textarea} />
            <ErrorMessage name="content" component="span" className={styles.error} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field
              as="select"
              id="tag"
              name="tag"
              className={styles.select}
              value={values.tag}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFieldValue('tag', e.target.value as NoteTag)
              }
            >
              {ALLOWED_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Field>
            <ErrorMessage name="tag" component="span" className={styles.error} />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
