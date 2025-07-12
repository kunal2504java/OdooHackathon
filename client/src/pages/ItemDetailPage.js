import React, { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { doc, onSnapshot, updateDoc, getDoc, collection, query, where, addDoc } from 'firebase/firestore';
import { db, appId } from 'firebase/config';

const ItemDetailPage = ({ itemId, navigate }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, userData } = useAuth();

  // New state for the swap modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [mySwapableItems, setMySwapableItems] = useState([]);
  const [selectedOfferItemId, setSelectedOfferItemId] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);

  // Effect to fetch the main item's details
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

  // Effect to fetch the logged-in user's items for the swap modal
  useEffect(() => {
    if (!user) return;

    const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/items`);
    const q = query(
      itemsCollectionRef,
      where("uploaderId", "==", user.uid),
      where("status", "==", "available")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMySwapableItems(userItems);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRedeem = async () => {
    // ... (existing handleRedeem function remains the same)
  };

  const handleOpenSwapModal = () => {
    if (!user) {
        alert("Please log in to request a swap.");
        return;
    }
    if (mySwapableItems.length === 0) {
        alert("You have no available items to offer for a swap. Please list an item first.");
        return;
    }
    setIsSwapModalOpen(true);
  };

  const handleSendSwapRequest = async () => {
    if (!selectedOfferItemId) {
        alert("Please select an item to offer.");
        return;
    }
    setSwapLoading(true);

    const newSwapRequest = {
        requesterId: user.uid,
        requesterEmail: userData.email,
        requesterItemId: selectedOfferItemId,
        
        ownerId: item.uploaderId,
        ownerEmail: item.uploaderEmail,
        ownerItemId: item.id,
        
        status: 'pending',
        createdAt: new Date(),
    };

    try {
        const swapsCollectionRef = collection(db, `artifacts/${appId}/public/data/swaps`);
        await addDoc(swapsCollectionRef, newSwapRequest);
        alert("Swap request sent successfully!");
        setIsSwapModalOpen(false);
    } catch (err) {
        console.error("Error sending swap request:", err);
        alert("Failed to send swap request. Please try again.");
    } finally {
        setSwapLoading(false);
    }
  };

  if (loading) return <p className="text-center pt-10 text-gray-400">Loading item details...</p>;
  if (error) return <p className="text-center pt-10 text-red-400">{error}</p>;
  if (!item) return <p className="text-center pt-10 text-gray-400">Item not found.</p>;

  const isOwner = user && user.uid === item.uploaderId;

  return (
    <>
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
                    <button 
                      onClick={handleOpenSwapModal}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                    >
                      Request Direct Swap
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

      {/* Swap Request Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">Offer an Item for Swap</h3>
            <p className="mb-6 text-gray-300">Select one of your available items to offer in exchange for "{item.title}".</p>
            <div className="mb-4">
              <label htmlFor="offerItem" className="block text-gray-400 mb-2">Your available items:</label>
              <select 
                id="offerItem"
                value={selectedOfferItemId}
                onChange={(e) => setSelectedOfferItemId(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>-- Select an item --</option>
                {mySwapableItems.map(myItem => (
                  <option key={myItem.id} value={myItem.id}>{myItem.title}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={() => setIsSwapModalOpen(false)} className="text-gray-400 hover:text-white">Cancel</button>
              <button 
                onClick={handleSendSwapRequest} 
                disabled={swapLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"
              >
                {swapLoading ? 'Sending...' : 'Send Swap Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemDetailPage;