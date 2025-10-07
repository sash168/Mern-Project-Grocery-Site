import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import React, { useState } from "react";

const SellerLayout = () => {
    const { axios, navigate } = useAppContext(); 
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

    const sidebarLinks = [
        { name: "Add Product", path: "/seller", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    ];

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/seller/logout');
            if (data.success) {
                toast.success(data.message);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <div className="flex items-center gap-2">
                    {/* Mobile sidebar toggle */}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        className="md:hidden p-2 rounded hover:bg-gray-100"
                        aria-label="Toggle Sidebar"
                    >
                        <img src={assets.menu_icon} alt="menu" className="w-6 h-6"/>
                    </button>
                    <Link to='/'>
                        <img className="cursor-pointer w-24 md:w-34" src={assets.logo} alt="logo" />
                    </Link>
                </div>
                <div className="flex items-center gap-5 text-gray-500">
                    <p>Hi! Admin</p>
                    <button onClick={logout} className='border rounded-full text-sm px-4 py-1'>Logout</button>
                </div>
            </div>

            <div className="flex relative">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-300 pt-4 md:static md:block transform 
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
                    {sidebarLinks.map((item) => (
                        <NavLink 
                            to={item.path} 
                            key={item.name} 
                            end={item.path === '/seller'}
                            onClick={() => setSidebarOpen(false)} // close on mobile
                            className={({isActive}) => `flex items-center py-3 px-4 gap-3 
                                ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                    : "hover:bg-gray-100/90 border-white"
                                }`
                            }
                        >
                            <img src={item.icon} alt='icon' className="w-7 h-7"/>
                            <p className="md:block hidden text-center">{item.name}</p>
                        </NavLink>
                    ))}
                </div>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

                {/* Main content */}
                <div className="flex-1 md:ml-64 p-4 md:p-8">
                    <Outlet/>
                </div>
            </div>
        </>
    );
};

export default SellerLayout;
