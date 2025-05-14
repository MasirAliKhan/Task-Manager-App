import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const quotes = [
  "Success is not the key to happiness. Happiness is the key to success.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Great things never come from comfort zones.",
  "Dream big and dare to fail.",
  "Action is the foundational key to all success.",
  "Productivity is never an accident."
];

export const NotificationContext = createContext();

function getLocalDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quote, setQuote] = useState("");
  const [notificationRefresh, setNotificationRefresh] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasks = await response.json();
      const today = getLocalDateOnly(new Date());
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const notifs = tasks
        .filter(task => task.status !== 'completed')
        .map(task => {
          let due;
          if (typeof task.dueDate === 'string') {
            const [year, month, day] = task.dueDate.split('T')[0].split('-');
            due = new Date(Number(year), Number(month) - 1, Number(day));
          } else {
            due = getLocalDateOnly(new Date(task.dueDate));
          }
          console.log('Due:', due, 'Today:', today, 'Raw:', task.dueDate);
          if (due < today) {
            return { id: task._id, msg: `"${task.title}" is overdue!` };
          } else if (due.getTime() === today.getTime()) {
            return { id: task._id, msg: `"${task.title}" is due today!` };
          } else if (due.getTime() === tomorrow.getTime()) {
            return { id: task._id, msg: `"${task.title}" is due tomorrow!` };
          } else {
            return null;
          }
        })
        .filter(Boolean);

      setNotifications(notifs);
    } catch (e) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [notificationRefresh]);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    // eslint-disable-next-line
  }, []);

  return (
    <NotificationContext.Provider value={{ setNotificationRefresh }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
            <div className="flex h-16 items-center justify-between px-4">
              <Link
                to="/dashboard"
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                Task Manager
              </Link>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      location.pathname === item.href
                        ? 'text-gray-500 dark:text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800">
            <div className="flex h-16 items-center px-4">
              <Link
                to="/dashboard"
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                Task Manager
              </Link>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      location.pathname === item.href
                        ? 'text-gray-500 dark:text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 shadow">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex flex-1 items-center justify-between px-4">
              <div className="flex-1 flex justify-center">
                <span className="text-base italic text-gray-600 dark:text-gray-300 text-center truncate max-w-xl">{quote}</span>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white dark:bg-gray-800 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={toggleTheme}
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>
                <div className="relative ml-6">
                  <button
                    className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                      <div className="p-2">
                        <h4 className="font-semibold mb-2 text-black dark:text-white">Notifications</h4>
                        {notifications.length === 0 ? (
                          <div className="text-gray-400 text-sm">No upcoming tasks.</div>
                        ) : (
                          <ul>
                            {notifications.map(n => (
                              <li key={n.id} className="text-sm text-black dark:text-white mb-1">{n.msg}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-6">
                    <Link
                      to="/profile"
                      className="text-base font-normal text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {user?.username}
                    </Link>
                    <button
                      onClick={logout}
                      className="text-base font-normal text-gray-500 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default Layout; 