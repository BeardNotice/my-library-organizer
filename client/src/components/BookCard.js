import React from 'react';
import { Link } from 'react-router-dom';
//import './BookCard.css';

function BookCard({ book }) {
  return (
    <div className="book-card">
      <h3>{book.title}</h3>
        <p>Author: {book.author}</p>
        <p>Genre: {book.genre}</p>
      <Link to={`/books/${book.id}`} className="btn">
        View Details
      </Link>
    </div>
  );
}

export default BookCard;