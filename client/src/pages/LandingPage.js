import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import ItemCard from '../components/ItemCard'; // We'll use the component we just made

const LandingPage = ({ navigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // This effect runs when the component mounts to fetch data from Firestore
  useEffect(() => {
    // Reference to the 'items' collection in Firestore
    const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/items`);
    
    // Create a query to get only items that are 'available' and 'approved'
    const q = query(
      itemsCollectionRef, 
      where("isApproved", "==", true), 
      where("status", "==", "available")
    );
    
    // onSnapshot creates a real-time listener. The item list will update automatically.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items: ", error);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array ensures this effect runs only once on mount

  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <div className="text-center py-20 my-8 md:my-10 bg-gray-800 rounded-xl shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Give Your Clothes a Second Life</h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Join the ReWear community to swap clothes you don't wear anymore. It's sustainable, fun, and free.
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('register')} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Start Swapping
          </button>
          <button 
            onClick={() => document.getElementById('featured-items').scrollIntoView({ behavior: 'smooth' })} 
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Items
          </button>
        </div>
      </div>

      {/* Featured Items Section */}
      <div id="featured-items" className="py-10">
        <h3 className="text-3xl font-bold text-center mb-8">Recently Added</h3>
        {loading ? (
          <p className="text-center text-gray-400">Loading items...</p>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map(item => <ItemCard key={item.id} item={item} navigate={navigate} />)}
          </div>
        ) : (
          <div className="text-center bg-gray-800 p-10 rounded-lg">
            <p className="text-gray-400">No items available at the moment. Be the first to list something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
