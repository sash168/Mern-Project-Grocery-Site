import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Navbar() {
    const [open, setOpen] = React.useState(false);
    const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCardCount, axios } = useAppContext();

    const logout = async () => {
        try {
            const { data } = await axios.get('api/user/logout')
            if (data.success) {
                toast.success(data.message)
                setUser(null);
                navigate('/');
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (typeof searchQuery === 'string' && searchQuery.length > 0) {
            navigate('/products')
        }
    }, [searchQuery])

    return (
        <nav className="bg-white border-b border-gray-300 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-3 sm:py-4 sticky top-0 z-50">
            
            {/* Top Row: Logo + Menu + Cart + User */}
            <div className="flex items-center justify-between w-full">
                {/* Logo */}
                <NavLink to='/' onClick={() => setOpen(false)}>
                    <img className="h-10 sm:h-12" src={assets.logo} alt="logo" />
                </NavLink>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-6 md:gap-8">
                    <NavLink to='/' className="hover:text-primary transition">Home</NavLink>
                    <NavLink to='/products' className="hover:text-primary transition">All Products</NavLink>
                    <NavLink to='/contact'>Contact</NavLink>
                </div>

                {/* Right side: Search (desktop), Cart & User */}
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
                        <img src={assets.nav_cart_icon} className='w-6 opacity-80' alt='cart' />
                        {getCardCount() > 0 && (
                            <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-5 h-5 flex items-center justify-center rounded-full">
                                {getCardCount()}
                                {console.log(getCardCount())}
                            </span>
                        )}
                    </div>

                    {/* User / Login */}
                    {!user ? (
                        <button onClick={() => setShowUserLogin(true)} className="cursor-pointer px-4 sm:px-6 py-2 bg-primary hover:bg-dull-primary transition text-white rounded-full text-sm sm:text-base">
                            Login
                        </button>
                    ) : (
                        <div className='relative group'>
                            <img src={assets.profile_icon} className='w-10 cursor-pointer' alt='profile' />
                            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-40 rounded-md text-sm z-50'>
                                <li onClick={() => navigate('/my-orders')} className='p-2 hover:bg-primary/10 cursor-pointer'>My Order</li>
                                <li onClick={() => navigate('/seller')} className='p-2 hover:bg-primary/10 cursor-pointer'>Seller Login</li>
                                <li onClick={logout} className='p-2 hover:bg-primary/10 cursor-pointer'>Logout</li>
                            </ul>
                        </div>

                    )}

                    {/* Mobile Menu Button */}
                    <button onClick={() => setOpen(!open)} className="sm:hidden ml-2" aria-label="Menu">
                        <img src={assets.menu_icon} alt='menu' className='w-6 h-6' />
                    </button>
                </div>
            </div>

            {/* Mobile Search (full width below top row) */}
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

            {/* Mobile Menu */}
            {open && (
                <div className="sm:hidden mt-2 flex flex-col gap-2 px-4 py-4 bg-white shadow-md text-sm z-40">
                    <NavLink to='/' onClick={() => setOpen(false)}>Home</NavLink>
                    <NavLink to='/products' onClick={() => setOpen(false)}>All Products</NavLink>
                    {user && <NavLink to='/my-orders' onClick={() => setOpen(false)}>My Order</NavLink>}
                    <NavLink to='/' onClick={() => setOpen(false)}>Contact</NavLink>
                    {!user ? (
                        <button onClick={() => { setOpen(false); setShowUserLogin(true); }} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-dull-primary transition text-white rounded-full text-sm">
                            Login
                        </button>
                    ) : (
                        <button onClick={logout} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-dull-primary transition text-white rounded-full text-sm">
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar;
