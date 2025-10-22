import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Route, Routes, useLocation ,Navigate} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrder from './pages/MyOrder';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/Seller/SellerLayout';
import AddProduct from './pages/Seller/AddProduct';
import ProductList from './pages/Seller/ProductList';
import Orders from './pages/Seller/Orders';
import Loading from './components/Loading';
import ContactUs from './pages/ContactUs';

//New Ui
import LoginPage from '@/NewSrc/components/LoginPage';
import AdminLayout from '@/NewSrc/components/AdminLayout';
import UserLayout from '@/NewSrc/components/UserLayout';
function App() {
  return (
    <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Admin Dashboard</div>} />
          <Route path="products" element={<div>Admin Products</div>} />
          <Route path="orders" element={<div>Admin Orders</div>} />
        </Route>
        
        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<div>User Home</div>} />
          <Route path="products" element={<div>User Products</div>} />
          <Route path="cart" element={<div>User Cart</div>} />
        </Route>
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}

export default App;


    // <div className='text-default min-h-screen text-gray-700 bg-white'>
    //   {isSellerPath ? null : <Navbar />}
    //   {showUserLogin ? <Login/> : null}
    //   <Toaster/>
    //   <div className={`${ isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
    //     <Routes>
    //       <Route path='/' element={<Home />}></Route>
    //       <Route path='/products' element={<AllProducts />}></Route>
    //       <Route path='/products/:category' element={<ProductCategory />}></Route>
    //       <Route path='/products/:category/:id' element={<ProductDetails />}></Route>
    //       <Route path='/cart' element={<Cart />}></Route>
    //       <Route path='/add-address' element={<AddAddress />}></Route>
    //       <Route path='/my-orders' element={<MyOrder />}></Route>
    //       <Route path='/loader' element={<Loading />}></Route>
    //       <Route path='/contact' element={<ContactUs />}></Route>
    //       <Route path='/seller' element={isSeller ? <SellerLayout/> :  <SellerLogin/>}>
    //         <Route index element={isSeller ? <AddProduct /> : null} />
    //         <Route path='product-list' element={<ProductList/>} />
    //         <Route path='orders' element={<Orders/>} />
    //       </Route>

    //     </Routes>
    //   </div>
    //   {!isSellerPath && <Footer/>}
    // </div>