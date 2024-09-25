// app/layout.tsx
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
};

export default Layout;
