import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl font-black text-indigo-600 tracking-tight">404</span>
      <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
        The destination URL you requested does not exist or has been relocated to another department.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={Home}>
            Return to Storefront
          </Button>
        </Link>
      </div>
    </div>
  );
};
