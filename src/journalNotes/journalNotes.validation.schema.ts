import { IJournalNote } from 'src/types';
import * as yup from 'yup';

export const journalNoteValidationSchema: {
  [key in keyof IJournalNote]?: yup.AnySchema;
} = {
  patient: yup.string().required(),
  title: yup.string().max(99).required(),
  details: yup.string().max(999).required(),
};

export const findJournalNotesValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  provider: yup.string(),
  patient: yup.string(),
  title: yup.string(),
  sort: yup.string(),
};
