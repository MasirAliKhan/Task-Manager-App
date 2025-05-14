import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { theme } from '../theme';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data);
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || ''
      }));
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.message || 'Failed to fetch profile');
      if (error.message === 'No authentication token found') {
        // Redirect to login if no token
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Only include password fields if they are provided
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      console.log('Updating profile with data:', { ...updateData, currentPassword: '***', newPassword: '***' }); // Debug log

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }

      if (!response.ok) {
        // Show all validation errors if present
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => toast.error(err.msg || err.message));
        } else {
          toast.error(data.message || 'Failed to update profile');
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className={theme.layout.container}>
      <div className={theme.layout.section}>
        <h1 className={theme.typography.h1}>Profile Settings</h1>
        {user && (
          <div className={`${theme.components.card.base} ${theme.spacing.card}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={theme.typography.small}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={theme.components.input.base}
                  required
                />
              </div>

              <div>
                <label className={theme.typography.small}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={theme.components.input.base}
                  required
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className={`${theme.typography.h2} mb-4`}>Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className={theme.typography.small}>Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className={theme.components.input.base}
                    />
                  </div>

                  <div>
                    <label className={theme.typography.small}>New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className={theme.components.input.base}
                    />
                  </div>

                  <div>
                    <label className={theme.typography.small}>Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={theme.components.input.base}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className={`${theme.components.button.base} ${theme.components.button.primary}`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 