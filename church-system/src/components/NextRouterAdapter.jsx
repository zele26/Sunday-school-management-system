'use client';

import React, { useState, useEffect } from 'react';
import { BrowserRouter, MemoryRouter, useInRouterContext } from 'react-router-dom';

function RouterBoundary({ children }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  let inRouter = false;
  try {
    inRouter = useInRouterContext();
  } catch (e) {
    inRouter = false;
  }

  if (inRouter) {
    return <>{children}</>;
  }

  // During SSR or pre-hydration, use MemoryRouter to prevent "BrowserRouter requires a DOM" error
  if (!isClient) {
    return (
      <MemoryRouter initialEntries={['/']}>
        {children}
      </MemoryRouter>
    );
  }

  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

export default function NextRouterAdapter({ children }) {
  return (
    <RouterBoundary>
      {children}
    </RouterBoundary>
  );
}
