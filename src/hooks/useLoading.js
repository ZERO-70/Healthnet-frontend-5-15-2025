import { useState, useCallback } from 'react';

/**
 * A custom hook for managing loading states and error handling in async operations
 * @returns {Object} Object containing loading state and withLoading function
 */
export const useLoading = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Wraps an async function with loading state management
   * @param {Function} asyncFunction - The async function to wrap
   * @param {Function} onError - Optional error handler function
   * @returns {Function} Wrapped function that manages loading state
   */
  const withLoading = useCallback((asyncFunction, onError) => {
    return async (...args) => {
      setLoading(true);
      try {
        const result = await asyncFunction(...args);
        return result;
      } catch (error) {
        console.error('Error in async operation:', error);
        if (onError && typeof onError === 'function') {
          onError(error);
        }
        return null;
      } finally {
        setLoading(false);
      }
    };
  }, []);

  return { loading, withLoading };
};

export default useLoading;
