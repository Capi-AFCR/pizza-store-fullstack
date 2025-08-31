import React, { useState, Dispatch, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ setError }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AxiosResponse<string> = await axios.post('/api/auth/forgot-password', { email });
      setMessage(t('forgot_password_form.success'));
      setError('');
      setLocalError('');
    } catch (err: any) {
      const errorMessage = t('forgot_password_form.error') + ' ' + (err.response?.data || err.message);
      setError(errorMessage);
      setLocalError(errorMessage);
      setMessage('');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('forgot_password_form.title')}</h2>
      {localError && <p className="text-red-500 mb-4 font-semibold">{localError}</p>}
      {message && <p className="text-green-500 mb-4 font-semibold">{message}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('forgot_password_form.email')}</label>
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
          {t('forgot_password_form.submit')}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;