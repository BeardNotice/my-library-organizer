// Central hook: delete or rate books, automatically update context
import { useContext } from 'react';
import { SessionContext } from '../contexts/SessionProvider';

export function useLibraryActions() {
  const { setSessionData } = useContext(SessionContext);

  async function deleteBook(libraryId, bookId) {
    try {
      const res = await fetch(`/api/libraries/${libraryId}/books/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Delete failed');
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.map(lib =>
          lib.id === libraryId
            ? { ...lib, books: lib.books.filter(b => b.id !== bookId) }
            : lib
        )
      }));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }

  async function rateBook(libraryId, bookId, rating) {
    try {
      const res = await fetch(`/api/libraries/${libraryId}/books/${bookId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      if (!res.ok) throw new Error('Rating failed');
      const updated = await res.json();
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
    } catch (error) {
      console.error('Error rating book:', error);
    }
  }

  async function deleteLibrary(libraryId) {
    try {
      const res = await fetch(`/api/libraries/${libraryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Delete library failed');
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.filter(lib => lib.id !== libraryId)
      }));
    } catch (error) {
      console.error('Error deleting library:', error);
    }
  }

  async function updateLibrary(libraryId, newName) {
    try {
      const res = await fetch(`/api/libraries/${libraryId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) throw new Error('Update library failed');
      const updatedLibrary = await res.json();
      setSessionData(prev => ({
        ...prev,
        libraries: prev.libraries.map(lib =>
          lib.id === updatedLibrary.id ? { ...updatedLibrary, id: updatedLibrary.id } : lib
        )
      }));
    } catch (error) {
      console.error('Error updating library:', error);
    }
  }

  return { deleteBook, rateBook, deleteLibrary, updateLibrary };
}
