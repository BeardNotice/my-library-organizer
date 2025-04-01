import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LibraryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}

export default LibraryRedirect;