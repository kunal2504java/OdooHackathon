import React from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Navbar = ({ navigate }) => {
  // Get user and userData from our AuthContext
  const { user, userData } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Navigate to landing page after sign out
      navigate('landing');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-gray-800/70 backdrop-blur-sm p-4 fixed w-full top-0 z-50 shadow-lg border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <h1 
          className="text-2xl font-bold text-green-400 cursor-pointer transition-transform transform hover:scale-105" 
          onClick={() => navigate('landing')}
        >
          ReWear
        </h1>
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button onClick={() => navigate('landing')} className="text-gray-300 hover:text-green-400 transition-colors">
            Browse
          </button>
          
          {user ? (
            // --- Links for Logged-In Users ---
            <>
              <button onClick={() => navigate('dashboard')} className="text-gray-300 hover:text-green-400 transition-colors">
                Dashboard
              </button>
              {userData?.role === 'admin' && (
                <button onClick={() => navigate('admin')} className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  Admin
                </button>
              )}
              <span className="text-yellow-400 font-semibold hidden sm:block">{userData?.pointsBalance || 0} Points</span>
              <button onClick={handleSignOut} className="text-gray-300 hover:text-red-400 transition-colors">
                Logout
              </button>
              <button 
                onClick={() => navigate('addItem')} 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                List Item
              </button>
            </>
          ) : (
            // --- Links for Logged-Out Users ---
            <>
              <button onClick={() => navigate('login')} className="text-gray-300 hover:text-green-400 transition-colors">
                Login
              </button>
              <button 
                onClick={() => navigate('register')} 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;