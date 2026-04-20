'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  Home, Package, Folder, CreditCard,
  Megaphone, Text, Flame, ChevronDown, Pencil, Tags, LogOut
} from 'lucide-react';
import { useLang } from '../app/providers/lang_provider';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [customersOpen, setCustomersOpen] = useState(false);
  const [username, setUsername] = useState('');

  const { lang, setLang, t } = useLang();

  // open customer submenu when path matches
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/customers')) {
      setCustomersOpen(true);
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [pathname]);

  const menuItems = [
    { key: 'Dashboard', href: '/dashboard', icon: Home },
    { key: 'Items', href: '/dashboard/items', icon: Package },
    {
      key: 'Optiopns',
      href: '/dashboard/banner',
      icon: Folder,
      children: [

        { key: 'Banner', href: '/dashboard/banner', icon: Megaphone },
        { key: 'Category', href: '/dashboard/banner/options/category', icon: Pencil },
        { key: 'Brand', href: '/dashboard/banner/options/item-brand', icon: Tags },
        { key: 'Text', href: '/dashboard/banner/options/text', icon: Text },
        { key: 'Top Items', href: '/dashboard/banner/options/top-items', icon: Flame },
      ],
    },
    { key: 'Order', href: '/dashboard/orders', icon: CreditCard },
    // { key: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const getActive = (href: string) => {
    if ((pathname === '/' || pathname === '/dashboard') && href === '/dashboard') return true;
    return pathname === href;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  // Simple loading guard so UI doesn't flicker with raw keys while loading translations
  // if (loading) {
  //   return (
  //     <div className="hidden sm:block w-64 bg-white shadow-md h-screen p-4">
  //       <div className="animate-pulse h-6 w-24 bg-gray-200 mb-4" />
  //       <div>Loading translations...</div>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 hidden h-screen w-64 flex-col overflow-y-auto bg-white shadow-md sm:flex">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 py-3 border-b border-gray-200">
          <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden rounded-lg">
            <Image
              src="/imgs/logo.png"
              alt="Logo"
              width={64}
              height={64}
              priority
              className="object-cover w-full h-full"
            />
          </div>
        </div>


        {/* Username Display - Welcome Back */}
        {/* {username && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Welcome Back</p>
            <p className="text-lg font-bold text-green-800 mt-1">{username}</p>
          </div>
        )} */}

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const hasChildren = !!item.children?.length;
            const isActive =
              pathname === item.href ||
              (hasChildren && item.children!.some((c) => pathname === c.href));

            const Icon = item.icon;

            if (hasChildren) {
              return (
                <div key={item.key}>
                  <button
                    onClick={() => setCustomersOpen(!customersOpen)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded ${
                      isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{t(item.key)}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 mr-2 transition-transform ${
                        customersOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {customersOpen && (
                    <div className="pl-6 mt-1 space-y-1">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;

                        return (
                          <Link key={child.key} href={child.href}>
                            <Button
                              variant={childActive ? 'default' : 'ghost'}
                              className={`w-full justify-start text-sm ${
                                childActive
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <ChildIcon className="mr-2 h-3 w-3" />
                              {t(child.key)}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.key} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    isActive
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {t(item.key)}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-2 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('LogOut')}</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow sm:hidden flex justify-around py-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = getActive(item.href);

          return (
            <Link key={item.key} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={`flex flex-col ${
                  isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <Icon className="h-6 w-6" />
              </Button>
            </Link>
          );
        })}
      </div>
    </>
  );
}
