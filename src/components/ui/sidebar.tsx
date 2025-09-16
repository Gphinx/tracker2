import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar(){
  const links = [
    ['Home','/'],['Dashboard','/dashboard'],['Admin','/admin'],['Quick Actions','/quick'],['RealTime','/realtime'],['Time Log','/timelog'],['Tracker','/tracker']
  ];
  return (
    <aside className='w-64 bg-gray-900 p-4 min-h-screen'>
      <h2 className='text-lg font-bold mb-4'>shadcn-ui</h2>
      <nav className='flex flex-col gap-2'>
        {links.map(([label,to])=> (
          <NavLink key={to} to={to} className={({isActive})=> 'px-3 py-2 rounded ' + (isActive? 'bg-gray-700':'hover:bg-gray-800') }>{label}</NavLink>
        ))}
      </nav>
    </aside>
  )
}
