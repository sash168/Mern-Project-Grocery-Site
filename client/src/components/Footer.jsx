import { assets, footerLinks } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 mt-20 bg-primary/10">
      <div className="flex flex-col md:flex-row justify-between gap-10 py-10 border-b border-gray-400/30 text-gray-600">
        {/* Left section: Logo + text */}
        <div className="flex-1 min-w-[240px]">
          <img
            className="w-20 sm:w-20 md:w-17"
            src={assets.logo}
            alt="Site logo"
          />
          <p className="max-w-md mt-4 text-sm sm:text-base leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum unde
            quaerat eveniet cumque accusamus atque qui error quo enim fugiat?
          </p>
        </div>

        {/* Right section: Footer Links */}
        <div className="flex flex-wrap justify-between gap-8 sm:gap-10 md:gap-12 w-full md:w-[50%]">
          {footerLinks.map((section, index) => (
            <div key={index} className="min-w-[120px]">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-5 text-sm sm:text-base">
                {section.title}
              </h3>
              <ul className="space-y-1 text-xs sm:text-sm">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Text */}
      <p className="py-4 text-center text-xs sm:text-sm md:text-base text-gray-500/80">
        © {new Date().getFullYear()} Sash.dev — All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
