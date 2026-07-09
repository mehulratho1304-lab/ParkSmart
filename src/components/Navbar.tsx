import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { 
  Compass, 
  History, 
  QrCode, 
  BarChart3, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Wallet, 
  Menu, 
  X,
  Plus
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentUser, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    activeTab, 
    setActiveTab,
    topUpWallet
  } = useParking();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');

  if (!currentUser) return null;

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (!isNaN(amt) && amt > 0) {
      topUpWallet(amt);
      setShowTopUp(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Book Spot', icon: Compass },
    { id: 'history', label: 'My Bookings', icon: History },
    { id: 'scanner', label: 'QR Scan / Gate', icon: QrCode },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: BarChart3 });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <span className="font-extrabold text-lg tracking-wider">P</span>
            </div>
            <div>
              <span className="font-bold text-lg text-zinc-950 dark:text-white tracking-tight block">
                ParkSmart
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium -mt-1 block">
                IoT Cloud System
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons (Wallet, Theme, Profile/Logout) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wallet Widget */}
            <div className="relative">
              <button 
                id="wallet-btn"
                onClick={() => setShowTopUp(!showTopUp)}
                className="flex items-center gap-2 px-3  py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
              >
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  ₹{currentUser.balance.toFixed(0)}
                </span>
                <Plus className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-950" />
              </button>

              {/* Wallet Top-up popover */}
              {showTopUp && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-700 p-4 z-50">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">Top Up Demo Wallet</h4>
                  <form onSubmit={handleTopUp} className="flex gap-2">
                    <input 
                      type="number" 
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full text-sm px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Amount"
                      min="10"
                    />
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-lg font-medium"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-950 dark:hover:text-white transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* User Profile Info & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-100 dark:border-zinc-800">
              <div className="text-right">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium capitalize block -mt-0.5">
                  {currentUser.role}
                </span>
              </div>
              <button
                id="logout-btn"
                onClick={logout}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-2 pb-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                ₹{currentUser.balance.toFixed(0)}
              </span>
            </div>
            <button 
              onClick={() => {
                topUpWallet(500);
                alert("₹500 added successfully for testing!");
              }}
              className="text-xs bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-400 px-3 py-1 rounded-lg font-medium"
            >
              + ₹500
            </button>
          </div>

          <div className="pt-3 flex items-center justify-between px-4">
            <div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">{currentUser.name}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">{currentUser.role}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-red-500 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
