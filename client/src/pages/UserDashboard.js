import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase.config';
import ItemCard from '../components/ItemCard';

const UserDashboard = ({ navigate }) => {
  const { user, userData } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no user is logged in, redirect to the login page
    if (!user) {
      navigate('login');
      return;
    }

    // Fetch items listed by the current user
    const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/items`);
    const q = query(itemsCollectionRef, where("uploaderId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user items: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]); // Rerun effect if user or navigate changes

  // Display a loading message while user data is being fetched
  if (!userData) {
    return <p className="text-center pt-10 text-gray-400">Loading dashboard...</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* User Profile Header */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Welcome, {userData.email}</h2>
          <p className="text-yellow-400 text-2xl font-bold mt-2">{userData.pointsBalance} Points</p>
        </div>
        <div className="text-left md:text-right mt-4 md:mt-0">
          <p className="text-sm text-gray-400">User ID:</p>
          <span className="font-mono text-xs bg-gray-700 p-1 rounded">{user.uid}</span>
        </div>
      </div>
      
      {/* User's Listings */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">My Listings</h3>
        {loading ? (
          <p className="text-center text-gray-400">Loading your items...</p>
        ) : myItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {myItems.map(item => <ItemCard key={item.id} item={item} navigate={navigate} />)}
          </div>
        ) : (
          <div className="text-center bg-gray-800 p-10 rounded-lg">
            <p className="text-gray-400">You haven't listed any items yet.</p>
            <button 
              onClick={() => navigate('addItem')}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
            >
              List Your First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;