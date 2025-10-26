import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Menu, X } from "lucide-react";

const SellerLayout = () => {
  const { axios, navigate, setIsSeller } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
  ];

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout", { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setIsSeller(false); // <-- update frontend state
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Prevent background scroll when sidebar open (on mobile)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-2 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Toggle button (visible only on small screens) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-200 transition md:hidden"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          <Link to="/">
            <img
              className="cursor-pointer h-12 sm:h-14"
              src={assets.logo}
              alt="logo"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4 text-gray-600 text-sm md:text-base">
          <p className="hidden sm:block">Hi, admin</p>
          <button
            onClick={logout}
            className="border border-gray-400 rounded-full px-4 py-1 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[30px] md:top-[60px]
        h-[calc(100vh-30px)] md:h-[calc(100vh-60px)]
        bg-white border-r border-gray-300 z-30 flex flex-col pt-12 transition-transform duration-300
        w-16 md:w-54 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {sidebarLinks.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === "/seller"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4
              ${isActive
                ? "bg-primary/10 border-r-4 border-primary text-primary"
                : "hover:bg-gray-100/90"}`
            }
          >
            <img src={item.icon} alt="icon" className="w-6 h-6" />
            <p className="hidden md:block">{item.name}</p> {/* Text only for large screen */}
          </NavLink>
        ))}
      </aside>

      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-54 ml-0 transition-all duration-300 p-1 md:p-2">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
