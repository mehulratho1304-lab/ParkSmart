import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { KeyRound, Mail, User, ShieldCheck, HelpCircle, Car, ArrowRight } from 'lucide-react';

export default function AuthScreen() {
  const { login, register } = useParking();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('user@parking.com');
  
  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVehicle, setRegVehicle] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regVehicle.trim()) {
      alert("Please fill in all details.");
      return;
    }
    register(regName.trim(), regEmail.trim(), regVehicle.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-8 relative transition-colors">
        
        {/* Decorative background flare */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/10 font-black text-2xl tracking-wider">
            P
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">ParkSmart Gateway</h1>
            <p className="text-xs text-zinc-400 font-semibold tracking-wide uppercase mt-0.5">Enterprise IoT Fleet Controller</p>
          </div>
        </div>

        {/* Quick Demo Accout Selector (The "Action" board) */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/80 space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Instant Sandbox Access
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setLoginEmail('user@parking.com');
                setIsSignUp(false);
                login('user@parking.com');
              }}
              id="quick-login-user"
              className="px-3 py-2 bg-white dark:bg-zinc-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 rounded-xl text-left text-xs font-semibold transition"
            >
              <span className="block text-zinc-850 dark:text-zinc-200">Sarah (User)</span>
              <span className="text-[10px] text-zinc-400 font-normal">user@parking.com</span>
            </button>
            <button
              onClick={() => {
                setLoginEmail('admin@parking.com');
                setIsSignUp(false);
                login('admin@parking.com');
              }}
              id="quick-login-admin"
              className="px-3 py-2 bg-white dark:bg-zinc-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 rounded-xl text-left text-xs font-semibold transition"
            >
              <span className="block text-zinc-850 dark:text-zinc-200">John (Admin)</span>
              <span className="text-[10px] text-zinc-400 font-normal">admin@parking.com</span>
            </button>
          </div>
        </div>

        {/* Authentication forms */}
        {!isSignUp ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  id="login-email-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                Security Password (Simulation)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  disabled
                  value="•••••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-400 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/10"
            >
              <span>Verify and Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sarah@resistance.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                License Plate Number
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={regVehicle}
                  onChange={(e) => setRegVehicle(e.target.value)}
                  placeholder="KA-05-MM-1234"
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold uppercase tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* View Swapper Footer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isSignUp ? 'Already registered? Log in here' : "First time visiting? Register vehicle details"}
          </button>
        </div>

      </div>
    </div>
  );
}
