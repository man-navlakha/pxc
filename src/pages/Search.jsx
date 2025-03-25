import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://pixel-classes.onrender.com/api/home/QuePdf');
      setSearchResults(response.data);
    } catch (err) {
      setError('Error fetching data');
    }
    setLoading(false);
  };

  return (
    <div className="search-container">
      <button onClick={search}>Search</button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="results">
        {searchResults.map(result => (
          <div key={result.id} className="result-item">
            <h3>{result.name}</h3>
            <p><strong>Subject:</strong> {result.sub}</p>
            <p><strong>Semester:</strong> {result.sem}</p>
            <p><strong>Division:</strong> {result.div}</p>
            <p><strong>Year:</strong> {result.year}</p>
            <p><strong>Type:</strong> {result.choose}</p>
            <p><strong>Date Created:</strong> {result.dateCreated}</p>
            <p><strong>Time Created:</strong> {result.timeCreated}</p>
            <a href={result.pdf} target="_blank" rel="noopener noreferrer">View PDF</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;