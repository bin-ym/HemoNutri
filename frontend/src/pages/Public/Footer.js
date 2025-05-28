// src/pages/Public/Footer.js
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-10 text-white bg-gray-900">
      <div className="max-w-3xl px-4 mx-auto text-center">
        {/* Contact Info */}
        <div className="mb-6 space-y-2 text-sm sm:text-base">
          <p>
            {t('email')}: <a href="mailto:support@hemonutri.com" className="hover:text-blue-400">support@hemonutri.com</a>
          </p>
          <p>
            {t('phone')}: <a href="tel:+251933456789" className="hover:text-blue-400">+251-933-456-789</a>
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-6 text-xl text-gray-400">
          <a href="https://facebook.com/hemonutri" aria-label={t('facebook')} className="transition hover:text-white">
            <FaFacebook />
          </a>
          <a href="https://twitter.com/hemonutri" aria-label={t('twitter')} className="transition hover:text-white">
            <FaTwitter />
          </a>
          <a href="https://instagram.com/hemonutri" aria-label={t('instagram')} className="transition hover:text-white">
            <FaInstagram />
          </a>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-sm text-gray-500 border-t border-gray-700">
          © {new Date().getFullYear()} {t('copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;