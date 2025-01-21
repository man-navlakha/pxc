import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../componets/Navbar';
import LastF from '../componets/LastF';
import Footer from '../componets/Footer';

const NotesSharingPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subb = queryParams.get('sub');

  console.log(subb);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleAddNote = () => {
    if (title && content) {
      const newNote = {
        id: Date.now(),
        title,
        content,
        files,
      };
      setNotes([...notes, newNote]);
      setTitle('');
      setContent('');
      setFiles([]);
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-4">Notes for {subb}</h1>
        <div className="backdrop-filter backdrop-blur-sm bg-opacity-50 backdrop-saturate-100 backdrop-contrast-100 bg-blend-overlay p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Add a Note</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block bg-white text-gray-700 text-sm font-bold mb-2" htmlFor="files">
              Upload Files
            </label>
            <input
              id="files"
              type="file"
              multiple
              onChange={handleFileChange}
              className="shadow bg-white appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            {files.length > 0 && (
              <div>
                <p className="text-gray-700">Files to be uploaded:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="p-4 border bg-white rounded-lg shadow">
                      <p className="text-gray-700 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleAddNote}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Note
          </button>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Shared Notes for {subb}</h2>
          {notes.length === 0 ? (
            <p className="text-gray-700">No notes shared yet for {subb}.</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="mb-4 p-4 bg-gray-200 border border-gray-300 rounded-lg shadow">
                <h3 className="text-xl font-bold">{note.title}</h3>
                <p className="text-gray-700">{note.content}</p>
                {note.files.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {note.files.map((file, index) => (
                      <div key={index} className="p-4 border bg-white rounded-lg shadow">
                        <p className="text-gray-700 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="lg:hidden md:block block">
        <LastF />
      </div>
      <div className="mt-36">
        <Footer />
      </div>
    </>
  );
};

export default NotesSharingPage;