import BookCard from './BookCard';
import './Library.css';


function Library({ libraries }) {

  const library = Array.isArray(libraries) ? libraries[0] : libraries;

  if (!library) {
    return <p>No library found for this user.</p>;
  }

  return (
    <div className="library-container">
      <h2>{library.name}</h2>
      {library.books && library.books.length > 0 ? (
        <div className="book-cards">
          {library.books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p>No books found in your library.</p>
      )}
    </div>
  );
}

export default Library;