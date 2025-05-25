import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-8 text-white bg-blue-800">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-200">
              HemoNutri
            </h3>
            <p className="text-gray-300">{t("footer_description")}</p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-200">
              {t("quick_links")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 transition-colors duration-300 hover:text-blue-600"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 transition-colors duration-300 hover:text-blue-600"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 transition-colors duration-300 hover:text-blue-600"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-200">
              {t("contact_us")}
            </h3>
            <p className="text-gray-300">{t("email")}: support@hemonutri.com</p>
            <p className="text-gray-300">{t("phone")}: +251-933-456-789</p>
          </div>
        </div>
        <div className="pt-4 mt-8 text-center border-t border-blue-700">
        </div>
      </div>
    </footer>
  );
};

export default Footer;
