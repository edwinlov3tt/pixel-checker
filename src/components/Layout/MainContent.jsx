import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main className="ml-20 mt-20 p-8 min-h-[calc(100vh-80px)]">
      {children}
    </main>
  );
};

export default MainContent;