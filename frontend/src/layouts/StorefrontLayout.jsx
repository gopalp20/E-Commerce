import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/customer/Navbar';
import { Footer } from '../components/customer/Footer';

export const StorefrontLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
