'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function Header() {
  const pathname = usePathname();

  // Don't render the header on the auth page
  if (pathname === '/auth') {
    return null;
  }

  return <Navbar />;
}