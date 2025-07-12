import React, { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, appId } from 'firebase/config';
import ItemCard from 'components/ItemCard';

const UserDashboard = ({ navigate }) => {
  const { user, userData } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [incomingSwaps, setIncomingSwaps] = useState([]);
  const [outgoingSwaps, setOutgoingSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect for fetching user's own items
  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }

    const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/items`);
    const q = query(itemsCollectionRef, where("uploaderId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMyItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  // Effect for fetching swap requests
  useEffect(() => {
    if (!user) return;

    const swapsCollectionRef = collection(db, `artifacts/${appId}/public/data/swaps`);

    // Fetch Incoming Swaps (where I am the owner)
    const incomingQuery = query(swapsCollectionRef, where("ownerId", "==", user.uid), where("status", "==", "pending"));
    const unsubIncoming = onSnapshot(incomingQuery, (snapshot) => {
      setIncomingSwaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Outgoing Swaps (where I am the requester)
    const outgoingQuery = query(swapsCollectionRef, where("requesterId", "==", user.uid));
    const unsubOutgoing = onSnapshot(outgoingQuery, (snapshot) => {
      setOutgoingSwaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user]);

  const handleAcceptSwap = async (swap) => {
    if (!window.confirm("Are you sure you want to accept this swap? Both items will become unavailable.")) return;

    const batch = writeBatch(db);

    // 1. Update the swap request status to 'accepted'
    const swapDocRef = doc(db, `artifacts/${appId}/public/data/swaps`, swap.id);
    batch.update(swapDocRef, { status: 'accepted' });

    // 2. Update the owner's item (your item) to 'swapped'
    const ownerItemRef = doc(db, `artifacts/${appId}/public/data/items`, swap.ownerItemId);
    batch.update(ownerItemRef, { status: 'swapped' });

    // 3. Update the requester's item to 'swapped'
    const requesterItemRef = doc(db, `artifacts/${appId}/public/data/items`, swap.requesterItemId);
    batch.update(requesterItemRef, { status: 'swapped' });

    try {
      await batch.commit();
      alert("Swap accepted successfully!");
    } catch (error) {
      console.error("Error accepting swap: ", error);
      alert("Failed to accept swap.");
    }
  };

  const handleRejectSwap = async (swapId) => {
    if (!window.confirm("Are you sure you want to reject this swap request?")) return;
    
    const swapDocRef = doc(db, `artifacts/${appId}/public/data/swaps`, swapId);
    try {
      await updateDoc(swapDocRef, { status: 'rejected' });
      alert("Swap rejected.");
    } catch (error) {
      console.error("Error rejecting swap: ", error);
      alert("Failed to reject swap.");
    }
  };


  if (!userData) return <p className="text-center pt-10 text-gray-400">Loading dashboard...</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* User Profile Header */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
        {/* ... existing profile header JSX ... */}
      </div>

      {/* Swap Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Incoming Requests */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Incoming Swap Requests</h3>
          <div className="bg-gray-800 p-4 rounded-xl space-y-4">
            {incomingSwaps.length > 0 ? incomingSwaps.map(swap => (
              <div key={swap.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p><span className="font-bold text-green-400">{swap.requesterEmail}</span> wants to swap with you.</p>
                  <p className="text-sm text-gray-400">Status: {swap.status}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleAcceptSwap(swap)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded">Accept</button>
                  <button onClick={() => handleRejectSwap(swap.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">Reject</button>
                </div>
              </div>
            )) : <p className="text-gray-400 text-center p-4">No incoming swap requests.</p>}
          </div>
        </div>
        {/* Outgoing Requests */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Outgoing Swap Requests</h3>
          <div className="bg-gray-800 p-4 rounded-xl space-y-4">
            {outgoingSwaps.length > 0 ? outgoingSwaps.map(swap => (
              <div key={swap.id} className="bg-gray-700 p-4 rounded-lg">
                <p>Your request to <span className="font-bold text-green-400">{swap.ownerEmail}</span></p>
                <p className={`text-sm font-bold ${
                  swap.status === 'pending' ? 'text-yellow-400' :
                  swap.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                }`}>Status: {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</p>
              </div>
            )) : <p className="text-gray-400 text-center p-4">You haven't made any swap requests.</p>}
          </div>
        </div>
      </div>
      
      {/* User's Listings */}
      <div>
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
