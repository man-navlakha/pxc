import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://pixel-classes.onrender.com/api/home/QuePdf');
      const filtered = response.data.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (err) {
      setError('Error fetching data');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-gray-800 text-white flex flex-col items-center">
      {/* App Bar */}
      <header className="w-full p-4 text-center bg-white/10 backdrop-blur-lg border-b border-white/20 text-xl font-bold text-cyan-300 shadow-md">
        PDF Search App
      </header>

      {/* Search Input Area */}
      <div className="w-full px-4 pt-6 pb-4 sticky top-16 z-10 bg-gradient-to-b from-slate-900 to-transparent">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Search PDF name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button
            onClick={search}
            className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-full font-semibold text-white transition"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Results Scroll Area */}
      <div className="flex-1 w-full overflow-y-auto px-4 pb-6">
        {loading && <p className="text-center text-cyan-300">Loading...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {searchResults.length === 0 && !loading && (
          <p className="text-center text-gray-400 mt-10">No results yet. Try searching.</p>
        )}

        <div className="space-y-4 mt-2">
          {searchResults.map(result => (
            <div
              key={result.id}
              className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl transition shadow-md"
            >
              <h3 className="text-lg font-semibold text-cyan-300 mb-1">{result.name}</h3>
              <p className="text-sm"><strong>Subject:</strong> {result.sub}</p>
              <p className="text-sm"><strong>Semester:</strong> {result.sem}</p>
              <p className="text-sm"><strong>Division:</strong> {result.div}</p>
              <p className="text-sm"><strong>Year:</strong> {result.year}</p>
              <p className="text-sm"><strong>Type:</strong> {result.choose}</p>
              <p className="text-sm"><strong>Date:</strong> {result.dateCreated} | <strong>Time:</strong> {result.timeCreated}</p>
              <a
                href={result.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-cyan-400 hover:underline text-sm"
              >
                📄 View PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
