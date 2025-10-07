import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

function Loading() {
  const { navigate } = useAppContext();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const nextUrl = query.get('next');

  useEffect(() => {
    if (nextUrl) {
      const timer = setTimeout(() => {
        navigate(nextUrl);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [nextUrl]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-6">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-gray-300 border-t-primary"></div>

      {/* Loading text */}
      <p className="mt-6 text-gray-600 text-sm sm:text-base md:text-lg font-medium text-center">
        Redirecting, please wait...
      </p>
    </div>
  );
}

export default Loading;
