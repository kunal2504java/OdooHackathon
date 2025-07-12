import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

const ItemDetailPage = ({ itemId, navigate }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!itemId) {
        navigate('landing');
        return;
    };
    
    const itemDocRef = doc(db, `artifacts/${appId}/public/data/items`, itemId);
    
    const unsubscribe = onSnapshot(itemDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Item not found.");
      }
      setLoading(false);
    }, (err) => {
        console.error("Error fetching item details:", err);
        setError("Failed to load item details.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [itemId, navigate]);

  const handleRedeem = async () => {
    const cost = 10; // Static cost for an item
    
    if (!user || !userData) {
      alert("Please log in to redeem items.");
      return;
    }
    if (item.uploaderId === user.uid) {
      alert("You cannot redeem your own item.");
      return;
    }
    if (userData.pointsBalance < cost) {
      alert("You don't have enough points to redeem this item.");
      return;
    }

    if (!window.confirm(`Are you sure you want to spend ${cost} points to redeem this item?`)) {
        return;
    }

    try {
      // 1. Deduct points from the redeemer
      const redeemerDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
      await updateDoc(redeemerDocRef, {
        pointsBalance: userData.pointsBalance - cost
      });

      // 2. Add points to the item's uploader
      const uploaderDocRef = doc(db, `artifacts/${appId}/users`, item.uploaderId);
      const uploaderDoc = await getDoc(uploaderDocRef);
      if (uploaderDoc.exists()) {
        const uploaderData = uploaderDoc.data();
        await updateDoc(uploaderDocRef, {
          pointsBalance: uploaderData.pointsBalance + cost
        });
      }
      
      // 3. Update the item's status to 'swapped'
      const itemDocRef = doc(db, `artifacts/${appId}/public/data/items`, itemId);
      await updateDoc(itemDocRef, {
        status: 'swapped'
      });

      alert("Item redeemed successfully!");
      navigate('dashboard');

    } catch (error) {
      console.error("Error redeeming item: ", error);
      alert("An error occurred during redemption. Please try again.");
    }
  };

  if (loading) return <p className="text-center pt-10 text-gray-400">Loading item details...</p>;
  if (error) return <p className="text-center pt-10 text-red-400">{error}</p>;
  if (!item) return <p className="text-center pt-10 text-gray-400">Item not found.</p>;

  const isOwner = user && user.uid === item.uploaderId;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden md:flex">
        <div className="md:w-1/2">
          <img 
            src={item.images?.[0] || 'https://placehold.co/600x600/1a202c/4ade80?text=ReWear'} 
            alt={item.title} 
            className="w-full h-full object-cover max-h-[70vh]"
          />
        </div>
        <div className="p-8 md:w-1/2 flex flex-col">
          <h2 className="text-4xl font-bold mb-2">{item.title}</h2>
          <p className="text-gray-400 mb-4">Listed by {item.uploaderEmail}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">{item.category}</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">Size: {item.size}</span>
            <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">Condition: {item.condition}</span>
          </div>

          <p className="text-gray-300 mb-8 flex-grow">{item.description}</p>
          
          <div className="mt-auto">
            {item.status === 'available' ? (
              isOwner ? (
                <p className="text-yellow-400 font-semibold text-center bg-gray-700 p-3 rounded-lg">This is your listing.</p>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={handleRedeem} 
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    Redeem for 10 Points
                  </button>
                  <button className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50" disabled>
                    Request Direct Swap (Coming Soon)
                  </button>
                </div>
              )
            ) : (
              <p className="text-red-500 font-bold text-xl text-center p-4 bg-gray-700 rounded-lg">This item is no longer available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;