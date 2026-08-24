import api from '../api/client';

export const uploadDocument = async (file, documentType) => {
  const form = new FormData();
  form.append('document', file);
  form.append('document_type', documentType);
  const response = await api.post('/api/v1/upload/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data?.document;
};
