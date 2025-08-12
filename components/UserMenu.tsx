import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <img
          src={user.picture}
          alt={user.name}
          className="w-9 h-9 rounded-full ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-purple-500"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
          <div className="p-4 border-b dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};