import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = async () => {
    try {
      // Check if using mock auth mode
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        localStorage.removeItem('mockUser');
        window.location.reload();
        return;
      }

      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">TourBooking</Link>
        <div className="nav-links">
          <Link to="/tours">Tours</Link>
          {user ? (
            <div className="user-menu">
              {/* BUG: Username display issue - this is intentional for the test */}
              <span>Welcome, {user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;