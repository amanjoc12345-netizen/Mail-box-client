import { useState, useCallback } from 'react';

const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = useCallback(async (requestConfig) => {
    if (!requestConfig.silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method ? requestConfig.method : 'GET',
        headers: requestConfig.headers ? requestConfig.headers : {},
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
      });

      if (!response.ok) {
        throw new Error(requestConfig.errorMessage || 'Request failed!');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || 'Something went wrong!');
      throw err;
    } finally {
      if (!requestConfig.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    isLoading,
    error,
    sendRequest,
    setError,
  };
};

export default useHttp;
