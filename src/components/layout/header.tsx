'use client';

import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  // Don't render Navbar on the auth page
  if (pathname === '/auth') {
    return null;
  }
  
  return <Navbar />;
}
