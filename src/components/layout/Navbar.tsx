'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { User, LogOut, Wrench, FilePlus, Menu, Home, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (pathname === '/auth') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const navLinks = [
    { href: '/', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
    { href: '/tool', label: 'Optimizer Tool', icon: <Wrench className="mr-2 h-4 w-4" /> },
    { href: '/create', label: 'Create Resume', icon: <FilePlus className="mr-2 h-4 w-4" /> },
  ];
  
  if (user?.role === 'admin') {
    navLinks.push({ href: '/admin', label: 'Admin', icon: <Shield className="mr-2 h-4 w-4" /> });
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              ResumeAI
            </Link>
            
            {user && (
              <nav className="hidden md:flex items-center space-x-4 ml-6">
                {navLinks.map(link => (
                   <Link 
                    key={link.href}
                    href={link.href} 
                    className={cn(
                      "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                      pathname === link.href && "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-2">
             {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {navLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                            <Link href={link.href} className="cursor-pointer">
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                            <SheetHeader>
                                <SheetTitle className="sr-only">Main Menu</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Main navigation menu for the application.
                                </SheetDescription>
                             </SheetHeader>
                            <nav className="flex flex-col h-full">
                                <div className="border-b pb-4">
                                     <Link href="/" className="text-xl font-bold" onClick={() => setIsSheetOpen(false)}>
                                        ResumeAI
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-2 py-4 flex-1">
                                    {navLinks.map((link) => (
                                        <SheetClose key={link.href} asChild>
                                            <Link href={link.href} className="flex items-center p-2 rounded-md hover:bg-muted font-medium">
                                                {link.icon} {link.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                                <div className="mt-auto border-t pt-4">
                                    <SheetClose asChild>
                                        <Link href="/profile" className="flex items-center p-2 rounded-md hover:bg-muted font-medium text-sm cursor-pointer w-full">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </SheetClose>
                                    <button
                                        className="flex items-center p-2 rounded-md hover:bg-muted font-medium text-sm cursor-pointer w-full text-red-600"
                                        onClick={() => {
                                            handleLogout();
                                            setIsSheetOpen(false);
                                        }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}