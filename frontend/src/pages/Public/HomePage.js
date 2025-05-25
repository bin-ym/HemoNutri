import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { HeartPulse, ClipboardList, Users } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
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
    <div className="flex flex-col min-h-screen text-black bg-gray-100">
      <Navbar role={null} />

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[90vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-60" />
        <div className="relative z-10 px-4 text-center text-white animate-fade-in">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl">
            {t("welcome_to_hemonutri")}
          </h1>
          <p className="mb-6 text-xl md:text-2xl">
            {t("nutrition_partner")}
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 text-lg transition duration-300 bg-blue-600 rounded-full shadow-md hover:bg-blue-700"
          >
            {t("get_started")}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-5xl px-6 mx-auto text-center">
          <h2 className="mb-10 text-4xl font-bold text-blue-700">
            About HemoNutri
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 transition transform shadow-md bg-rose-100 rounded-xl hover:shadow-lg hover:scale-105">
              <HeartPulse className="w-8 h-8 mx-auto mb-3 text-rose-600" />
              <h3 className="mb-2 text-xl font-semibold text-rose-700">Our Mission</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Empowering hemodialysis patients with personalized nutrition tools
                for improved health, confidence, and independence.
              </p>
            </div>
            <div className="p-6 transition transform bg-indigo-100 shadow-md rounded-xl hover:shadow-lg hover:scale-105">
              <ClipboardList className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
              <h3 className="mb-2 text-xl font-semibold text-indigo-700">What We Offer</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Tailored meal plans, smart tracking, and expert guidance aligned
                with modern kidney care standards.
              </p>
            </div>
            <div className="p-6 transition transform shadow-md bg-emerald-100 rounded-xl hover:shadow-lg hover:scale-105">
              <Users className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
              <h3 className="mb-2 text-xl font-semibold text-emerald-700">Supportive Community</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                A connected space for patients and professionals to share, support,
                and thrive together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section ref={whyChooseRef} className="py-20 bg-white">
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center text-blue-700">
            {t("why_choose_hemonutri")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {["track_nutrition", "learn_grow", "connect_providers"].map((item, index) => (
              <div
                key={item}
                className="p-8 transition-transform transform bg-gray-100 shadow-lg opacity-0 why-choose-card rounded-xl hover:scale-105"
              >
                <div className="text-center card-content">
                  <div className="mb-3 text-4xl">
                    {["🍎", "📚", "👩‍⚕️"][index]}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-blue-800">
                    {t(item)}
                  </h3>
                  <p className="text-gray-700">{t(`${item}_desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Banner */}
      <section className="py-16 text-center text-white bg-blue-900">
        <h3 className="mb-4 text-3xl font-bold">🌟 Join Our Mission</h3>
        <p className="max-w-2xl mx-auto mb-6 text-lg">
          Whether you're a patient, caregiver, or healthcare expert, your voice matters.
          Help us build a smarter, more supportive future in kidney nutrition care.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3 font-bold text-blue-900 transition bg-white rounded-full hover:bg-gray-200"
        >
          Get Involved
        </button>
      </section>
    </div>
  );
};

export default HomePage;
