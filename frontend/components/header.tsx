'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, Settings, User, Activity, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Left Section - Logo/Brand */}
          <div className="flex items-center gap-3">
            <div>
              <Image
                src="/Ministry-of-Health-Logo.png"
                alt="PPS Logo"
                width={50}
                height={50}
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
                Point Prevalence Survey System
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ministry of Health Uganda
              </p>
            </div>
          </div>

          {/* Center Section - Search */}
          {/* <div className="flex-1 max-w-lg mx-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" />
              <Input
                type="search"
                placeholder="Search patients, data, reports..."
                className="pl-10 w-full border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>
          </div> */}

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary" className="text-xs">
                    3
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="text-sm font-medium">New patient data</span>
                  <span className="text-xs text-slate-500">2 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="text-sm font-medium">Report generated</span>
                  <span className="text-xs text-slate-500">1 hour ago</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Settings */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>Export Settings</DropdownMenuItem>
                <DropdownMenuItem>Theme</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* About */}
            <Link href="/about">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:bg-slate-500 dark:hover:bg-slate-800"
                title="About"
              >
                <Info className="h-4 w-4" />
              </Button>
            </Link>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User</p>
                    <p className="text-xs leading-none text-slate-500">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Three colored bars */}
      <div className="flex flex-col w-full">
        <div className="h-1 bg-black"></div>
        <div className="h-1 bg-yellow-500"></div>
        <div className="h-1 bg-red-500"></div>
      </div>
    </header>
  );
}
