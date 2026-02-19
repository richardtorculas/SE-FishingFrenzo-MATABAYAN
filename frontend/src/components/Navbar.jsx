import React from 'react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-dark-blue h-16 flex items-center justify-between px-6 shadow-md">
      {/* Left Side - Brand Area */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        <div className="bg-light-blue border-2 border-dark-blue rounded-lg px-6 py-2">
          <span className="text-dark-blue font-bold text-lg uppercase">MATABAYAN</span>
        </div>
      </div>

      {/* Right Side - Auth Button */}
      <button className="bg-gray-100 border-2 border-dark-blue rounded-full px-6 py-2 text-dark-blue font-semibold hover:bg-gray-200 transition shadow-sm">
        LOG - IN / SIGN UP
      </button>
    </nav>
  );
};

export default Navbar;
