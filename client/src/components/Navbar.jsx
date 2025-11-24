import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCardCount,
    axios,
  } = useAppContext();

  const dropdownRef = useRef(null);

  const logout = async () => {
    try {
      const { data } = await axios.get('api/user/logout', { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Detect click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (typeof searchQuery === 'string' && searchQuery.length > 0 && window.location.pathname !== '/products') {
      navigate('/products');
    }
  }, [searchQuery]);

  return (
    <nav className="bg-white border-b border-gray-300 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-3 sm:py-4 sticky top-0 z-50">
      {/* Top Row */}
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <NavLink to="/" onClick={() => setProfileOpen(false)}>
          <img className="h-12 sm:h-14" src={assets.logo} alt="logo" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6 md:gap-8">
          <NavLink to="/" className="hover:text-primary transition">Home</NavLink>
          <NavLink to="/products" className="hover:text-primary transition">All Products</NavLink>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Desktop Search */}
          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full max-w-xs">
            <input
              type="text"
              placeholder="Search products"
              value={typeof searchQuery === 'string' ? searchQuery : ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1.5 outline-none bg-transparent placeholder-gray-500"
            />
            <img src={assets.search_icon} className="w-4 h-4" alt="search" />
          </div>

          {/* Cart */}
          <div onClick={() => navigate('/cart')} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} className="w-6 opacity-80" alt="cart" />
            {getCardCount() > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-5 h-5 flex items-center justify-center rounded-full">
                {getCardCount()}
              </span>
            )}
          </div>

          {/* Profile Icon + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <img
              src={assets.profile_icon}
              className="w-9 sm:w-10 cursor-pointer"
              alt="profile"
              onClick={() => setProfileOpen(!profileOpen)}
            />

            {profileOpen && (
              <ul className="absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-40 rounded-md text-sm z-50">
                {user ? (
                  <>
                    <li
                      className="lg:hidden p-2 hover:bg-primary/10 cursor-pointer"
                      onClick={() => { navigate('/'); setProfileOpen(false); }}
                    >
                      Home
                    </li>
                    <li
                      className="lg:hidden p-2 hover:bg-primary/10 cursor-pointer"
                      onClick={() => { navigate('/products'); setProfileOpen(false); }}
                    >
                      All Products
                    </li>

                    <li
                      onClick={() => { navigate('/my-orders'); setProfileOpen(false); }}
                      className="p-2 hover:bg-primary/10 cursor-pointer"
                    >
                      My Order
                    </li>
                    <li
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="p-2 hover:bg-primary/10 cursor-pointer"
                    >
                      Logout
                    </li>
                  </>
                ) : (
                  <li
                    onClick={() => { setShowUserLogin(true); setProfileOpen(false); }}
                    className="p-2 hover:bg-primary/10 cursor-pointer"
                  >
                    User Login
                  </li>
                )}
                <li
                  onClick={() => { navigate('/seller'); setProfileOpen(false); }}
                  className="p-2 hover:bg-primary/10 cursor-pointer"
                >
                  Admin Login
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden mt-2 flex items-center border border-gray-300 px-3 rounded-full">
        <input
          type="text"
          placeholder="Search products"
          value={typeof searchQuery === 'string' ? searchQuery : ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-1.5 outline-none bg-transparent placeholder-gray-500"
        />
        <img src={assets.search_icon} className="w-4 h-4" alt="search" />
      </div>
    </nav>
  );
}

export default Navbar;
