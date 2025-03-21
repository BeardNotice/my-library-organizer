import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Library from '../components/Library';
//import './Home.css';

function Home() {
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5555/library', { credentials: 'include' })
      .then(response => {
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Not authenticated');
        }
        if (!response.ok) {
          throw new Error('Error fetching library');
        }
        return response.json();
      })
      .then(data => {
        setLibraryData(data);
      })
      .catch(error => {
        console.error('Error fetching library data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <p>Loading your library...</p>;
  }

  return (
    <div className="home-container">
      <h1>Your Library</h1>
      {libraryData && libraryData.length > 0 ? (
         <Library libraryData={libraryData} />
      ) : (
         <p>No library data found.</p>
      )}
      <div className="button-group">
        <Link to="/books/new" className="btn">
          Add New Book
        </Link>
      </div>
    </div>
  );
}

export default Home;