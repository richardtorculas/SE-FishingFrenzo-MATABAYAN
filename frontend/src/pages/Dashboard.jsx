import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CategoryPanel from '../components/CategoryPanel';

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 bg-light-blue min-h-[calc(100vh-4rem)] border-l-2 border-gray-300 shadow-inner">
          <CategoryPanel />
          
          {/* Main Content Area */}
          <div className="px-8 py-6">
            {/* Dynamic content will go here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
