import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';

const LoginPage = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use Firebase to sign the user in
      await signInWithEmailAndPassword(auth, email, password);
      // On success, navigate to their dashboard
      navigate('dashboard');
    } catch (err) {
      // On failure, display a user-friendly error message
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center py-10 md:py-20">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              required 
            />
          </div>
          {error && <p className="text-red-400 text-center mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <button onClick={() => navigate('register')} className="text-green-400 hover:underline font-semibold">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;