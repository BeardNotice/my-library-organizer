import React from 'react';
import Select from 'react-select';
import { useContext } from 'react';
import { SessionContext } from '../index';

function AutocompleteBookSelect({ onChange }) {
  const { sessionData } = useContext(SessionContext);
  const books = sessionData?.libraries?.flatMap(lib => lib.books) || [];
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