import React, { Dispatch, SetStateAction, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface ResetPasswordFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ setError }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('reset_password_form.error_mismatch'));
      setLocalError(t('reset_password_form.error_mismatch'));
      return;
    }
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setMessage(t('reset_password_form.success'));
      setError('');
      setLocalError('');
    } catch (err: any) {
      const errorMessage = t('reset_password_form.error') + ' ' + (err.response?.data || err.message);
      setError(errorMessage);
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('reset_password_form.title')}</h2>
      {localError && <p className="text-red-500 mb-4 font-semibold">{localError}</p>}
      {message && <p className="text-green-500 mb-4 font-semibold">{message}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('reset_password_form.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('reset_password_form.confirm_password')}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
        >
          {t('reset_password_form.submit')}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;