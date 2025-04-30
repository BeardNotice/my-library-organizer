import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../contexts/SessionProvider';

export function useRequireLogin() {
  const { sessionData } = useContext(SessionContext);
  const isLoggedIn = Boolean(sessionData?.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);
}