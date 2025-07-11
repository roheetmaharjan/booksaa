'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function UploadForm() {
  const { data: session, status } = useSession();
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>You must be signed in to upload.</p>;

  async function handleUpload(e) {
    e.preventDefault();
    setError('');

    const file = e.target.elements.file.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Upload failed');
    } else {
      setImageUrl(json.url);
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input type="file" name="file" accept="image/*" />
      <button type="submit">Upload</button>
      {error && <p className="text-red-500">{error}</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-4 w-48 h-auto" />}
    </form>
  );
}
