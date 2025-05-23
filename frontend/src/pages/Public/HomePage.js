import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import heroImage from "../../assets/hero-image.jpg";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const whyChooseRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".why-choose-card");
            cards.forEach((card, index) => {
              card.classList.add("animate-card-enter");
              const content = card.querySelector(".card-content");
              content.classList.add("animate-content-reveal");
              card.style.animationDelay = `${index * 0.2}s`;
              content.style.animationDelay = `${index * 0.2 + 0.3}s`;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (whyChooseRef.current) {
      observer.observe(whyChooseRef.current);
    }

    return () => {
      if (whyChooseRef.current) {
        observer.unobserve(whyChooseRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar role={null} />

      {/* Hero Section */}
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
            className="px-6 py-3 text-lg text-white transition duration-300 bg-blue-500 rounded-full hover:bg-blue-600"
          >
            {t("get_started")}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-4xl p-6 mx-auto text-center">
          <h2 className="mb-12 text-3xl font-bold text-center text-blue-600">
            About HemoNutri
          </h2>
          <p className="mb-4 text-lg text-gray-700">
            HemoNutri is a digital tool designed to support hemodialysis patients
            in managing their nutrition and fluid intake. Built by ours, it
            empowers patients with personalized meal plans, dietary tracking, and
            educational resources while enabling healthcare providers and
            administrators to monitor and support patient care.
          </p>
          <p className="text-gray-600">Get started by registering or logging in!</p>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-white" ref={whyChooseRef}>
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-blue-600">
            {t("why_choose_hemonutri")}
          </h2>
          <div className="grid grid-cols-1 gap-8 transition duration-300 md:grid-cols-3 blow-on-hover">
            <div
              className="p-6 text-center bg-gray-100 rounded-lg shadow-md opacity-0 why-choose-card card-hover-effect"
              aria-labelledby="track-nutrition"
            >
              <div className="card-content">
                <div className="mb-4 text-4xl">🍎</div>
                <h3
                  id="track-nutrition"
                  className="mb-2 text-xl font-semibold"
                >
                  {t("track_nutrition")}
                </h3>
                <p className="text-gray-600">{t("track_nutrition_desc")}</p>
              </div>
            </div>
            <div
              className="p-6 text-center bg-gray-100 rounded-lg shadow-md opacity-0 why-choose-card card-hover-effect"
              aria-labelledby="learn-grow"
            >
              <div className="card-content">
                <div className="mb-4 text-4xl">📚</div>
                <h3
                  id="learn-grow"
                  className="mb-2 text-xl font-semibold"
                >
                  {t("learn_grow")}
                </h3>
                <p className="text-gray-600">{t("learn_grow_desc")}</p>
              </div>
            </div>
            <div
              className="p-6 text-center bg-gray-100 rounded-lg shadow-md opacity-0 why-choose-card card-hover-effect"
              aria-labelledby="connect-providers"
            >
              <div className="card-content">
                <div className="mb-4 text-4xl">👩‍⚕️</div>
                <h3
                  id="connect-providers"
                  className="mb-2 text-xl font-semibold"
                >
                  {t("connect_providers")}
                </h3>
                <p className="text-gray-600">{t("connect_providers_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-6xl p-6 mx-auto">
          <h2 className="mb-6 text-3xl font-bold text-blue-600">Contact Us</h2>
          <p className="text-gray-700">
            Reach out to us at{" "}
            <a
              href="mailto:support@hemonutri.com"
              className="text-blue-500 hover:underline"
            >
              support@hemonutri.com
            </a>{" "}
            for any questions or support.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-white bg-blue-600">
        <div className="max-w-6xl px-4 mx-auto text-center">
          <p>{t("footer_copyright")}</p>
          <div className="mt-2">
            <a href="#about" className="mx-2 text-white hover:underline">
              {t("about")}
            </a>
            <a href="#contact" className="mx-2 text-white hover:underline">
              {t("contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;