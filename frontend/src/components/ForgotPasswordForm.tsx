import React, { useState, Dispatch, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios';

interface ForgotPasswordFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ setError }) => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AxiosResponse<string> = await axios.post('/api/auth/forgot-password', { email });
      setError('');
      alert(response.data); // Displays "Password reset token sent to your email (logged to console)."
    } catch (err: any) {
      setError(err.response?.data || 'Failed to send reset token');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
        >
          Send Reset Token
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;