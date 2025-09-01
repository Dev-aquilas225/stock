import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Moon, Sun, LogOut, User, Bell, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotificationsContext  } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';

const Header: React.FC = () => {
  const { user, displayUser, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotificationsContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now()); // Initialize with timestamp
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Refresh imageKey when user or displayUser changes
  useEffect(() => {
    if (user?.profilePicture || displayUser?.profilePicture) {
      setImageError(false); // Reset error on user change
      setImageKey(Date.now()); // Refresh cache
    }
  }, [user, displayUser]);

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image load error:", (user || displayUser)?.profilePicture, e);
    try {
      const response = await fetch((user || displayUser)?.profilePicture || '');
      console.error("Image fetch status:", response.status, response.statusText);
    } catch (fetchError) {
      console.error("Image fetch error:", fetchError);
    }
    setImageError(true);
    showToast({
      type: "error",
      title: "Erreur",
      message: "Impossible de charger l'image de profil",
      duration: 4000,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
    showToast({
      type: "info",
      title: "Déconnexion",
      message: "Vous avez été déconnecté avec succès.",
      duration: 3000,
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-nexsaas-vanta-black/95' : 'bg-nexsaas-pure-white/95'
        } backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-nexsaas-light-gray'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-nexsaas-deep-blue rounded-lg">
              <Building2 className="w-6 h-6 text-nexsaas-pure-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'
              }`}>
              FOREVER SAAS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-nexsaas-light-gray'
                }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-nexsaas-saas-green" />
              ) : (
                <Moon className="w-5 h-5 text-nexsaas-deep-blue" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-nexsaas-light-gray'
                      }`}
                  >
                    <Bell className={`w-5 h-5 ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'
                      }`} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-nexsaas-light-gray'
                      }`}
                  >
                    {(user || displayUser)?.profilePicture && !imageError ? (
                      <img
                        src={`${(user || displayUser)?.profilePicture}?t=${imageKey}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center" />
                    )}
                    <span className={`text-sm font-medium hidden lg:block ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'
                      }`}>
                      {(user || displayUser)?.nom} {(user || displayUser)?.prenom}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl shadow-xl border border-nexsaas-light-gray dark:border-gray-700"
                      >
                        <div className="p-4 border-b border-nexsaas-light-gray dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            {(user || displayUser)?.profilePicture && !imageError ? (
                              <img
                                src={`${(user || displayUser)?.profilePicture}?t=${imageKey}`}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center" />
                            )}
                            <div>
                              <p className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                {(user || displayUser)?.nom} {(user || displayUser)?.prenom}
                              </p>
                              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            to="/profil"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-left text-nexsaas-deep-blue dark:text-nexsaas-pure-white hover:bg-nexsaas-light-gray dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Mon profil</span>
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-left text-nexsaas-deep-blue dark:text-nexsaas-pure-white hover:bg-nexsaas-light-gray dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Tableau de bord</span>
                          </Link>
                        </div>

                        <div className="p-2 border-t border-nexsaas-light-gray dark:border-gray-700">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login-client"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark
                    ? 'text-nexsaas-pure-white hover:bg-gray-800'
                    : 'text-nexsaas-deep-blue hover:bg-nexsaas-light-gray'
                    }`}
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-4 py-2 text-sm font-medium text-nexsaas-pure-white bg-nexsaas-saas-green rounded-lg hover:bg-green-600 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-nexsaas-light-gray'
                }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-nexsaas-saas-green" />
              ) : (
                <Moon className="w-5 h-5 text-nexsaas-deep-blue" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-nexsaas-light-gray'
                }`}
            >
              {showMobileMenu ? (
                <X className={`w-6 h-6 ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden border-t ${isDark ? 'border-gray-800' : 'border-nexsaas-light-gray'
                } overflow-hidden`}
            >
              <div className="py-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* User Info Mobile */}
                    <div className="px-4 py-3 border-b border-nexsaas-light-gray dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {(user || displayUser)?.profilePicture && !imageError ? (
                          <img
                            src={`${(user || displayUser)?.profilePicture}?t=${imageKey}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center" />
                        )}
                        <div>
                          <p className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {(user || displayUser)?.nom} {(user || displayUser)?.prenom}
                          </p>
                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notifications Mobile */}
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-3 text-left transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-nexsaas-light-gray'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className={`w-5 h-5 ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'}`} />
                        <span className={`font-medium ${isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'}`}>
                          Notifications
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Navigation Links Mobile */}
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isDark ? 'hover:bg-gray-800 text-nexsaas-pure-white' : 'hover:bg-nexsaas-light-gray text-nexsaas-deep-blue'
                        }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Tableau de bord</span>
                    </Link>

                    <Link
                      to="/profil"
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isDark ? 'hover:bg-gray-800 text-nexsaas-pure-white' : 'hover:bg-nexsaas-light-gray text-nexsaas-deep-blue'
                        }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Mon profil</span>
                    </Link>

                    {/* Logout Mobile */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login-client"
                      onClick={() => setShowMobileMenu(false)}
                      className={`block px-4 py-3 font-medium transition-colors ${isDark ? 'text-nexsaas-pure-white hover:bg-gray-800' : 'text-nexsaas-deep-blue hover:bg-nexsaas-light-gray'
                        }`}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/inscription"
                      onClick={() => setShowMobileMenu(false)}
                      className="block mx-4 my-2 px-4 py-3 text-center font-medium text-nexsaas-pure-white bg-nexsaas-saas-green rounded-lg hover:bg-green-600 transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;