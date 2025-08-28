import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface ForgotPasswordFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ setError }) => {
  const [error, setLocalError] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Requesting password reset for:', email);
      const response = await axios.post('/api/auth/forgot-password', { email });
      setError('');
      setLocalError('');
      console.log('Reset token generated:', response.data);
      alert('Password reset token generated. Check console for token (email sending is mocked).');
    } catch (err: any) {
      const errorMessage = 'Failed to request password reset: ' + (err.response?.data || err.message);
      console.error(errorMessage);
      setError(errorMessage);
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Request Password Reset
        </button>
      </form>
      <div className="mt-4 text-center">
        <p><Link to="/login" className="text-blue-500">Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;