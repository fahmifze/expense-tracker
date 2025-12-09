import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/user.service';
import { AxiosError } from 'axios';
import { Modal, useToast } from '../components/ui';
import { formatDate } from '../utils/formatters';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      await userService.updateProfile({ firstName, lastName, currency });
      await refreshUser();
      showSuccess('Profile updated successfully!');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      showError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      showError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    try {
      await userService.deleteAccount(deletePassword);
      logout();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      showError(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      {/* Profile Information */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="btn-primary"
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary"
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Member since</span>
            <span className="text-gray-900">
              {user?.createdAt
                ? formatDate(user.createdAt, { year: 'numeric', month: 'long', day: 'numeric' })
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. All your data including expenses,
          categories, and profile information will be permanently deleted.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Account"
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          This action cannot be undone. Please enter your password to confirm.
        </p>

        <div className="mb-4">
          <label className="label">Password</label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="input"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={closeDeleteModal}
            className="flex-1 btn-secondary"
            disabled={deleteLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading || !deletePassword}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
