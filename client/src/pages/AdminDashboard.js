import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, appId } from '../firebase.config';

const AdminDashboard = ({ navigate }) => {
  const { userData } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a protected route. If the user is not an admin, redirect them.
    if (userData?.role !== 'admin') {
      navigate('landing');
      return;
    }

    // Query for items that are not yet approved and have not been rejected.
    const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/items`);
    const q = query(itemsCollectionRef, where("isApproved", "==", false), where("status", "==", "available"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items for admin: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, navigate]); // Rerun if userData changes

  const handleApproval = async (itemId, shouldApprove) => {
    const itemDocRef = doc(db, `artifacts/${appId}/public/data/items`, itemId);
    try {
      if (shouldApprove) {
        // If approving, set isApproved to true
        await updateDoc(itemDocRef, { isApproved: true });
      } else {
        // If rejecting, we can mark it as 'rejected' to remove it from this queue.
        // You could also implement a delete function here.
        await updateDoc(itemDocRef, { status: 'rejected' });
      }
    } catch (error) {
      console.error("Error updating item approval: ", error);
      alert("Failed to update item status.");
    }
  };

  if (loading) return <p className="text-center pt-10 text-gray-400">Loading admin panel...</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard: Pending Approvals</h2>
      <div className="bg-gray-800 p-4 rounded-xl shadow-2xl">
        {items.length > 0 ? (
          <ul className="space-y-4">
            {items.map(item => (
              <li key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700 p-4 rounded-lg">
                <div className="mb-4 md:mb-0">
                  <p className="font-bold">{item.title} <span className="text-sm font-normal text-gray-400">by {item.uploaderEmail}</span></p>
                  <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => handleApproval(item.id, true)} 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleApproval(item.id, false)} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400 p-8">No items are currently pending approval.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
