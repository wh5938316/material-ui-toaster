'use client';

import Toaster from 'material-ui-toaster';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
