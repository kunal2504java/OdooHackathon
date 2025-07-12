import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';

// Import Page Components (we will create these in the next steps)
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AddItemPage from './pages/AddItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // This state will act as our simple router
  const [page, setPage] = useState('landing'); 
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Navigation function to change pages
  const navigate = (pageName, itemId = null) => {
    setPage(pageName);
    setSelectedItemId(itemId);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  // A helper function to render the current page
  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage navigate={navigate} />;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      case 'dashboard':
        return <UserDashboard navigate={navigate} />;
      case 'addItem':
        return <AddItemPage navigate={navigate} />;
      case 'itemDetail':
        return <ItemDetailPage itemId={selectedItemId} navigate={navigate} />;
      case 'admin':
        return <AdminDashboard navigate={navigate} />;
      case 'landing':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="bg-gray-900 text-white min-h-screen font-sans">
        <Navbar navigate={navigate} />
        <main className="pt-20"> {/* Add padding to offset the fixed navbar */}
          {renderPage()}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
