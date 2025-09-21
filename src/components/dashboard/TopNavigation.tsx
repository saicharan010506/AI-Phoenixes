import React, { useState } from 'react';
import { User, Settings, LogOut, Trash2, Mic, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

interface TopNavigationProps {
  currentView: string;
  onViewChange: (view: 'dashboard' | 'settings' | 'recordings' | 'certifications') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout, deleteAccount } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      alert('Your KalaHasta account has been successfully deleted.');
    } catch (error) {
      alert('Failed to delete account. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Logo size="md" />
            <div className="flex space-x-6">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('recordings')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  currentView === 'recordings'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Recordings</span>
              </button>
              <button
                onClick={() => onViewChange('certifications')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  currentView === 'certifications'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certifications</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-white font-medium">{user.fullName}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-white font-medium">{user.fullName}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <p className="text-gray-400 text-sm">{user.primaryCraft}</p>
                </div>
                
                <button
                  onClick={() => {
                    onViewChange('settings');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
                
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Delete Account</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data, products, recordings, and certifications.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Permanently Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavigation;