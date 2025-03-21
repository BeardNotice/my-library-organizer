import React, {useEffect, useState } from 'react';
import Select from 'react-select';

function AutocompleteBookSelect({ onChange }) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5555/books', { credentials: 'include' })
        .then(response=>response.json())
        .then(data => {
            const opts = data.map(book=>({ value: book.id, label: book.title }));
            setOptions(opts);
        })
        .catch(error => console.error('Error fetching books:', error));
    }, []);

    return (<Select options={options} onChange={onChange} placeholder="Select a book..." isClearable isSearchable />
    );
}

export default AutocompleteBookSelect