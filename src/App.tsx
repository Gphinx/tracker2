import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/ui/sidebar';

export default function App(){ 
  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
