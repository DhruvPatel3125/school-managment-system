import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white  rounded-xl border border-slate-200  shadow-sm transition-colors">
      <div className="text-7xl mb-4">🔍</div>
      <h2 className="text-3xl font-extrabold text-slate-900  tracking-tight">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-slate-500  max-w-md">
        We couldn't find the page you are looking for. Please check the URL or return to the main dashboard.
      </p>
      <div className="mt-6">
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg shadow hover:opacity-90 active:scale-95 transition-all"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
