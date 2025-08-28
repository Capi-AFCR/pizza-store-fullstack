import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface ResetPasswordFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ setError }) => {
  const [error, setLocalError] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting password reset with token:', resetToken);
      await axios.post('/api/auth/reset-password', { resetToken, newPassword });
      setError('');
      setLocalError('');
      console.log('Password reset successful');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = 'Failed to reset password: ' + (err.response?.data || err.message);
      console.error(errorMessage);
      setError(errorMessage);
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block">Reset Token</label>
          <input
            type="text"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Reset Password
        </button>
      </form>
      <div className="mt-4 text-center">
        <p><Link to="/login" className="text-blue-500">Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;