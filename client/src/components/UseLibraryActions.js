// Central hook: delete or rate books, automatically update context
import { useContext } from 'react';
import { SessionContext } from '../index';

export function useLibraryActions() {
  const { setSessionData } = useContext(SessionContext);

  function deleteBook(libraryId, bookId) {
    return fetch(`/api/libraries/${libraryId}/books/${bookId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    .then(res => {
      if (!res.ok) throw new Error('Delete failed');
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.map(lib =>
          lib.id === libraryId
            ? { ...lib, books: lib.books.filter(b => b.id !== bookId) }
            : lib
        )
      }));
    });
  }

  function rateBook(libraryId, bookId, rating) {
    return fetch(`/api/libraries/${libraryId}/books/${bookId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    })
    .then(res => {
      if (!res.ok) throw new Error('Rating failed');
      return res.json();
    })
    .then(updated => {
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.map(lib => ({
          ...lib,
          books: lib.books.map(b =>
            b.id === bookId ? { ...b, rating: updated.rating } : b
          )
        })),
        books: prev.books.map(b =>
          b.id === bookId ? { ...b, rating: updated.rating } : b
        )
      }));
    });
  }

  return { deleteBook, rateBook };
}
