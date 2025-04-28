import React from 'react';
import { useLibraryActions } from './UseLibraryActions';
import './BookCard.css'

const cozyColors = [
  { background: '#d8c4a6', text: '#3b2f2f' }, // faded parchment + dark brown
  { background: '#c9b79c', text: '#2f1d1d' }, // warm beige + deep brown
  { background: '#b08968', text: '#fffaf5' }, // leather tan + soft ivory
  { background: '#a26745', text: '#fdf6ec' }, // reddish brown + cream
  { background: '#8b5e3c', text: '#f7f1e3' }, // deep wood + soft white
];

function StarRating({ rating, onRate }) {
  const [hover, setHover] = React.useState(0);
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

function BookCard({ book, allowDelete = true }) {
  const { deleteBook, rateBook } = useLibraryActions();
  // Pick colors for this card based on the book’s ID
  const index = book.id % cozyColors.length;
  const { background, text } = cozyColors[index];
  const style = { backgroundColor: background, color: text };


  return (
    <div className="book-card" style={{ ...style }}>
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>Genre: {book.genre}</p>
      <p>Published Year: {book.published_year}</p>
      <div className="rating-section">
        <p>Your Rating: {book.rating?.userRating ?? 'N/A'}</p>
        <p>Global Rating: {book.rating?.globalRating ?? 'N/A'}</p>
        <StarRating
          rating={book.rating?.userRating ?? 0}
          onRate={allowDelete ? stars => rateBook(book.libraryId, book.id, stars) : undefined}
        />
      </div>
      {allowDelete && (
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this book?')) {
              deleteBook(book.libraryId, book.id);
            }
          }}
          className="delete-button"
        >
          Delete Book
        </button>
      )}
    </div>
  );
}

export default BookCard;