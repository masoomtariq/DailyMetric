import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import GlobalEntryModal from './GlobalEntryModal';
import OnboardingTour from './OnboardingTour';
import QuickSetup from './QuickSetup';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  useEffect(() => {
    // Check if user has seen the quick setup
    const hasSeenQuickSetup = localStorage.getItem('habit_tracker_quick_setup');
    const hasSkippedQuickSetup = localStorage.getItem('habit_tracker_quick_setup_skipped');
    
    if (!hasSeenQuickSetup && !hasSkippedQuickSetup) {
      // Show quick setup after a short delay
      const timer = setTimeout(() => {
        setShowQuickSetup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Habit Tracker</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`dashboard-nav px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tracker"
                  className={`tracker-nav px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/tracker')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tracker
                </Link>
                <Link
                  to="/finance"
                  className={`finance-nav px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/finance')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Finance
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4 user-menu">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{user || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="global-entry-fab fixed bottom-24 md:bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-40"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Global Entry Modal */}
      <GlobalEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
      
      {/* Quick Setup Modal */}
      {showQuickSetup && (
        <QuickSetup 
          onComplete={() => setShowQuickSetup(false)}
          onClose={() => setShowQuickSetup(false)}
        />
      )}

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/dashboard') ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link
            to="/tracker"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/tracker') ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <ChartBarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Tracker</span>
          </Link>
          <Link
            to="/finance"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/finance') ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <CurrencyDollarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Finance</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;