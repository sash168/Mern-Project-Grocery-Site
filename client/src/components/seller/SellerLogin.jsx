import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

function SellerLogin() {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post("/api/seller/login", { email, password });
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);

  return (
    !isSeller && (
      <form
        onSubmit={onSubmitHandler}
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 text-sm text-gray-600"
      >
        <div className="flex flex-col gap-5 w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200">
          <p className="text-2xl sm:text-3xl font-semibold text-center">
            <span className="text-primary">Seller</span> Login
          </p>

          {/* Email Field */}
          <div className="w-full">
            <p className="font-medium text-gray-700 mb-1">Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Enter email"
              className="border border-gray-300 rounded-lg w-full p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          {/* Password Field */}
          <div className="w-full">
            <p className="font-medium text-gray-700 mb-1">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter password"
              className="border border-gray-300 rounded-lg w-full p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white font-medium w-full py-2 sm:py-3 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </form>
    )
  );
}

export default SellerLogin;
