import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Car,
  Calendar,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';
import { cn } from '../../utils';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Calendar },
    { name: 'My Bookings', href: '/my-bookings', icon: ClipboardList },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <div className="p-2 bg-primary-100 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl hidden sm:block">
                VehicleBook
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200',
                    isActive(item.href)
                      ? item.name === 'Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - user menu */}
          <div className="flex items-center gap-4">
            {/* Desktop user menu */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Avatar
                  name={user?.name || ''}
                  color={user?.avatarColor}
                  size="sm"
                />
                <span className="font-medium text-gray-700 max-w-[150px] truncate">
                  {user?.name}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                    Admin
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-500 transition-transform',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg py-2 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800 truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                          <Shield className="w-3 h-3" />
                          Administrator
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors',
                  isActive(item.href)
                    ? item.name === 'Admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <hr className="my-4 border-gray-100" />
            <div className="px-4 py-3 flex items-center gap-3">
              <Avatar
                name={user?.name || ''}
                color={user?.avatarColor}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800 truncate">{user?.name}</p>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
