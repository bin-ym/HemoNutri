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
  const [contactForm, setContactForm] = useState({
    email: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateContactForm = () => {
    const errors = {};
    if (!contactForm.email.trim()) {
      errors.email = t("email_required");
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.email = t("email_invalid");
    }
    if (!contactForm.message.trim()) errors.message = t("message_required");
    return errors;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const errors = validateContactForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error("Failed to submit contact form");
      }

      const result = await response.json();
      console.log("Contact Form Submission Response:", result);
      setContactForm({ email: "", message: "" });
      alert(t("contact_success"));
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert(t("contact_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="mb-6 text-xl md:text-2xl">{t("nutrition_partner")}</p>
        </div>
      </section>

      {/* About Section */}
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
            {["track_nutrition", "learn_grow", "connect_providers"].map(
              (item, index) => (
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
              )
            )}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-3xl px-6 mx-auto">
          <h2 className="mb-10 text-4xl font-bold text-center text-blue-700">
            {t("contact_us")}
          </h2>
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("enter_your_email")}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                rows="5"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  formErrors.message ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("enter_your_message")}
              />
              {formErrors.message && (
                <p className="mt-1 text-sm text-red-500">{formErrors.message}</p>
              )}
            </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 font-semibold text-white transition duration-300 bg-blue-600 rounded-full shadow-md ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? t("sending") : t("send_message")}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;