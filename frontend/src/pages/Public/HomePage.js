import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import heroImage from "../../assets/hero-image.jpg";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar role={null} />
      <section
        className="relative bg-cover bg-center h-[80vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 px-4 text-center text-white">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl animate-fade-in">
            {t("welcome_to_hemonutri")}
          </h1>
          <p className="mb-6 text-xl md:text-2xl">
            {t("nutrition_partner")}
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 text-lg text-white transition duration-300 bg-teal-500 rounded-full hover:bg-teal-600"
          >
            {t("get_started")}
          </button>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-teal-600">
            {t("why_choose_hemonutri")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 text-center transition duration-300 bg-gray-100 rounded-lg shadow-md hover:shadow-lg">
              <div className="mb-4 text-4xl">🍎</div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("track_nutrition")}
              </h3>
              <p className="text-gray-600">
                {t("track_nutrition_desc")}
              </p>
            </div>
            <div className="p-6 text-center transition duration-300 bg-gray-100 rounded-lg shadow-md hover:shadow-lg">
              <div className="mb-4 text-4xl">📚</div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("learn_grow")}
              </h3>
              <p className="text-gray-600">
                {t("learn_grow_desc")}
              </p>
            </div>
            <div className="p-6 text-center transition duration-300 bg-gray-100 rounded-lg shadow-md hover:shadow-lg">
              <div className="mb-4 text-4xl">👩‍⚕️</div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("connect_providers")}
              </h3>
              <p className="text-gray-600">
                {t("connect_providers_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-6 text-white bg-teal-600">
        <div className="max-w-6xl px-4 mx-auto text-center">
          <p>{t("footer_copyright")}</p>
          <div className="mt-2">
            <a href="/about" className="mx-2 text-white hover:underline">
              {t("about")}
            </a>
            <a href="/contact" className="mx-2 text-white hover:underline">
              {t("contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;