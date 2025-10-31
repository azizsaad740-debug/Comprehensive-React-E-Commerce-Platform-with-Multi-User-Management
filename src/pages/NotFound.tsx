import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from '@/components/layout/Layout';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
          <p className="text-2xl text-gray-800 mb-4">Oops! Page not found</p>
          <p className="text-gray-600 mb-8">The page you are looking for might have been removed or doesn't exist.</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline font-medium">
            Return to Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;