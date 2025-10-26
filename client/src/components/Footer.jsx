import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-50 text-gray-700 py-8 mt-20">
      <div className="container mx-auto px-6 flex flex-col items-center gap-4">
        
        {/* Menu Links */}
          {/* <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors">Home</a>
            <span className="text-gray-400">•</span>
            <Link to="/best-sellers" className="hover:text-green-600 transition-colors">
              Best Sellers
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/offers" className="hover:text-green-600 transition-colors">
              Offers & Deals
            </Link>
            <span className="text-gray-400">•</span>
            <a href="/contact" className="hover:text-green-600 transition-colors">All Products</a>
          </div> */}

        {/* Contact Details */}
        <div className="flex flex-col items-center text-gray-600 text-sm mt-2 gap-1">
          <p>Call: +91 9137127558</p>
          <p>Address: Bada Danda sahi, Bhimpur, Ganjam, Odissa - 761043, India</p>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-600 text-center mt-2 w-full">
          © {currentYear} Sash.dev. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
