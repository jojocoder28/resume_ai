'use client';

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
import { User, LogOut, Settings, Wrench, FilePlus } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

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

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              ResumeAI
            </Link>
            {user && (
              <nav className="hidden md:flex items-center space-x-4 ml-6">
                <Link 
                  href="/" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/tool" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Optimizer Tool
                </Link>
                <Link 
                  href="/create" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Resume
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : user ? (
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
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/tool" className="cursor-pointer">
                      <Wrench className="mr-2 h-4 w-4" />
                      <span>Optimizer Tool</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create" className="cursor-pointer">
                      <FilePlus className="mr-2 h-4 w-4" />
                      <span>Create Resume</span>
                    </Link>
                  </DropdownMenuItem>
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
    </nav>
  );
}
