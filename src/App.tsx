import React from 'react';
import { FilterProvider } from './context/FilterContext';
import Dashboard from './components/Dashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <FilterProvider>
      <div className="app">
        <Dashboard />
      </div>
    </FilterProvider>
  );
};

export default App;
