import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

const AddItemPage = ({ navigate }) => {
  const { user, userData } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tops');
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState('Good');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!user) {
      setError("You must be logged in to list an item.");
      setLoading(false);
      return;
    }

    // Basic validation
    if (!title || !description) {
        setError("Please fill out all required fields.");
        setLoading(false);
        return;
    }

    const newItem = {
      title,
      description,
      category,
      size,
      condition,
      images: [image || 'https://placehold.co/400x400/1a202c/4ade80?text=ReWear'],
      status: 'available',
      isApproved: false, // Items need admin approval by default
      uploaderId: user.uid,
      uploaderEmail: userData.email,
      createdAt: new Date(),
    };

    try {
      const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/items`);
      await addDoc(itemsCollectionRef, newItem);
      setSuccess("Item listed successfully! It's now pending admin approval.");
      // Reset form after a short delay
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setImage('');
        setCategory('Tops');
        setSize('M');
        setCondition('Good');
        setSuccess('');
        navigate('dashboard');
      }, 2000);
    } catch (err) {
      setError("An error occurred while listing the item. Please try again.");
      console.error("Add item error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6">List a New Item</h2>
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="title">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-green-500" required></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="category">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Tops</option><option>Bottoms</option><option>Dresses</option><option>Outerwear</option><option>Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="size">Size</label>
              <select id="size" value={size} onChange={(e) => setSize(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="condition">Condition</label>
              <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="image">Image URL (Optional)</label>
            <input type="text" id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/image.png" className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          
          {/* Feedback Messages */}
          {error && <p className="text-red-400 text-center mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
          {success && <p className="text-green-400 text-center mb-4 bg-green-900/50 p-3 rounded-lg">{success}</p>}
          
          <button type="submit" disabled={loading || success} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Submit Item for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage;