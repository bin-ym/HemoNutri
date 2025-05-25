import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="py-10 text-white bg-gray-900">
      <div className="max-w-3xl px-4 mx-auto text-center">
        {/* Contact Info */}
        <div className="mb-6 space-y-2 text-sm sm:text-base">
          <p>Email: support@hemonutri.com</p>
          <p>Phone: +251-933-456-789</p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-6 text-xl text-gray-400">
          <a href="#" aria-label="Facebook" className="transition hover:text-white">
            <FaFacebook />
          </a>
          <a href="#" aria-label="Twitter" className="transition hover:text-white">
            <FaTwitter />
          </a>
          <a href="#" aria-label="Instagram" className="transition hover:text-white">
            <FaInstagram />
          </a>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-sm text-gray-500 border-t border-gray-700">
          &copy; {new Date().getFullYear()} HemoNutri. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;