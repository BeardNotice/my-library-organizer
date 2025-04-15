import React, { useContext } from 'react';
import Select from 'react-select';
import { BookDataContext } from '../App';

function AutocompleteBookSelect({ onChange }) {
  const { books } = useContext(BookDataContext);

  const options = books.map(book => ({
    value: book.id,
    label: book.title,
    author: book.author
  }));

  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder="Select a book..."
      isClearable
      isSearchable
    />
  );
}

export default AutocompleteBookSelect;