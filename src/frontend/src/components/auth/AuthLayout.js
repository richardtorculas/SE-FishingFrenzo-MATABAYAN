import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      {children}
    </div>
  );
};

export default AuthLayout;
