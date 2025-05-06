import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CallbackPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code'); // Extract the authorization code

  useEffect(() => {
    if (code) {
      // Send the authorization code to your backend
      fetch('https://4499-196-224-227-105.ngrok-free.app/user/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('User authenticated:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [code]);

  return <div>Loading...</div>;
};

export default CallbackPage;