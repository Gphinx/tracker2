import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './pages/Index';
import NotFound from './pages/NotFound';
import Dashboard from './components/Dashboard';
import AdminDatabase from './components/AdminDatabase';
import QuickActions from './components/QuickActions';
import RealTimeActivityMonitor from './components/RealTimeActivityMonitor';
import TimeLogTable from './components/TimeLogTable';
import TimeTracker from './components/TimeTracker';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<HomePage/>} />
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='admin' element={<AdminDatabase/>} />
          <Route path='quick' element={<QuickActions/>} />
          <Route path='realtime' element={<RealTimeActivityMonitor/>} />
          <Route path='timelog' element={<TimeLogTable/>} />
          <Route path='tracker' element={<TimeTracker/>} />
          <Route path='*' element={<NotFound/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
