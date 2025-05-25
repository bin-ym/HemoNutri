import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { HeartPulse, ClipboardList, Users, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import heroImage from "../../assets/hero-image.jpg";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const whyChooseRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted:", formData);
    alert(t("contact_form_submitted"));
    setFormData({ name: "", email: "", message: "" });
  };

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

      {/* About Section - Now using translations */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-5xl px-6 mx-auto text-center">
          <h2 className="mb-10 text-4xl font-bold text-blue-700">
            {t("about_hemonutri")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 transition transform shadow-md bg-rose-100 rounded-xl hover:shadow-lg hover:scale-105">
              <HeartPulse className="w-8 h-8 mx-auto mb-3 text-rose-600" />
              <h3 className="mb-2 text-xl font-semibold text-rose-700">
                {t("our_mission")}
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {t("mission_description")}
              </p>
            </div>
            <div className="p-6 transition transform bg-indigo-100 shadow-md rounded-xl hover:shadow-lg hover:scale-105">
              <ClipboardList className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
              <h3 className="mb-2 text-xl font-semibold text-indigo-700">
                {t("what_we_offer")}
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {t("offer_description")}
              </p>
            </div>
            <div className="p-6 transition transform shadow-md bg-emerald-100 rounded-xl hover:shadow-lg hover:scale-105">
              <Users className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
              <h3 className="mb-2 text-xl font-semibold text-emerald-700">
                {t("supportive_community")}
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {t("community_description")}
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

      {/* Contact Us Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center text-blue-700">
            {t("contact_us")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <div className="p-8 bg-white rounded-lg shadow-md">
              <h3 className="mb-6 text-2xl font-semibold text-blue-800">
                {t("send_us_message")}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                    {t("your_name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                    {t("your_email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                    {t("your_message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t("send_message")}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="p-8 bg-white rounded-lg shadow-md">
              <h3 className="mb-6 text-2xl font-semibold text-blue-800">
                {t("contact_information")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mt-1 mr-3 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{t("address")}</h4>
                    <p className="text-gray-600">{t("company_address")}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mt-1 mr-3 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{t("email")}</h4>
                    <p className="text-gray-600">info@hemonutri.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mt-1 mr-3 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{t("phone")}</h4>
                    <p className="text-gray-600">+1 (123) 456-7890</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="mb-4 font-medium text-gray-900">{t("follow_us")}</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <FaFacebook size={24} />
                  </a>
                  <a href="#" className="text-blue-400 hover:text-blue-600">
                    <FaTwitter size={24} />
                  </a>
                  <a href="#" className="text-pink-600 hover:text-pink-800">
                    <FaInstagram size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;