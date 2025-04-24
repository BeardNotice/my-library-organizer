import React, { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../index';
import './BookCard.css'

const cozyColors = [
  { background: '#d8c4a6', text: '#3b2f2f' }, // faded parchment + dark brown
  { background: '#c9b79c', text: '#2f1d1d' }, // warm beige + deep brown
  { background: '#b08968', text: '#fffaf5' }, // leather tan + soft ivory
  { background: '#a26745', text: '#fdf6ec' }, // reddish brown + cream
  { background: '#8b5e3c', text: '#f7f1e3' }, // deep wood + soft white
];

function StarRating({ rating, onRate }) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: onRate ? 'pointer' : 'default', fontSize: '24px' }}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
        >
          {star <= (hover || rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

function BookCard({ book, onRate, onDelete, allowDelete = true }) {
  const { sessionData } = useContext(SessionContext);
  const isLoggedIn = Boolean(sessionData?.user);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const index = book.id % cozyColors.length;
    const { background, text } = cozyColors[index];
    setStyle({
      backgroundColor: background,
      color: text
    });
  }, [book.id]);


  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      const url = `/api/library/${book.libraryId}/books/${book.id}`;
      console.log("🔴 deleteBook URL:", url);
      fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })
      .then(response => {
        console.log("🔴 deleteBook response status:", response.status);
        if (response.ok) {
          if (onDelete) {
            onDelete(book.id);
          }
        } else {
          console.error('Failed to delete the book. Status:', response.status);
        }
      })
      .catch(error => console.error("Error deleting book:", error));
    }
  };

  return (
    <div className="book-card" style = {{...style}}>
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>Genre: {book.genre}</p>
      <p>Published Year: {book.published_year}</p>
      <div className="rating-section">
        {isLoggedIn && (
          <p>Your Rating: {book.rating?.userRating ?? 'N/A'}</p>
        )}
        <p>Global Rating: {book.rating?.globalRating ?? 'N/A'}</p>
        {onRate && (
          <StarRating
            rating={book.rating?.userRating ?? 0}
            onRate={(newRating) => onRate(book.id, newRating)}
          />
        )}
      </div>
      { isLoggedIn && allowDelete && (
        <button onClick={handleDelete} className="delete-button">Delete Book</button>
      )}
    </div>
  );
}

export default BookCard;