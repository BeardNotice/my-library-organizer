// Central hook: delete or rate books, automatically update context
import { useContext } from 'react';
import { SessionContext } from '../contexts/SessionProvider';

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

  function deleteLibrary(libraryId) {
    return fetch(`/api/libraries/${libraryId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    .then(res => {
      if (!res.ok) throw new Error('Delete library failed');
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.filter(lib => lib.id !== libraryId)
      }));
    });
  }

  function updateLibrary(libraryId, newName) {
    return fetch(`/api/libraries/${libraryId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    .then(res => {
      if (!res.ok) throw new Error('Update library failed');
      return res.json();
    })
    .then(updatedLibrary => {
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.map(lib =>
          lib.id === updatedLibrary.id ? { ...updatedLibrary, id: updatedLibrary.id } : lib
        )
      }));
    });
  }

  return { deleteBook, rateBook, deleteLibrary, updateLibrary };
}
