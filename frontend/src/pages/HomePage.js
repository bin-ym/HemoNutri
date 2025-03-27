import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import heroImage from '../assets/hero-image.jpg';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar role={null} />
      <section
        className="relative bg-cover bg-center h-[80vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            Welcome to HemoNutri
          </h1>
          <p className="text-xl md:text-2xl mb-6">
            Your partner in managing nutrition and wellness with ease.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-teal-500 text-white px-6 py-3 rounded-full text-lg hover:bg-teal-600 transition duration-300"
          >
            Get Started
          </button>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-teal-600 mb-12">
            Why Choose HemoNutri?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-4xl mb-4">🍎</div>
              <h3 className="text-xl font-semibold mb-2">Track Your Nutrition</h3>
              <p className="text-gray-600">
                Log food and fluid intake effortlessly to stay on top of your health.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Learn & Grow</h3>
              <p className="text-gray-600">
                Access educational resources tailored to your needs.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-4xl mb-4">👩‍⚕️</div>
              <h3 className="text-xl font-semibold mb-2">Connect with Providers</h3>
              <p className="text-gray-600">
                Collaborate with healthcare professionals for personalized care.
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-teal-600 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2025 HemoNutri. All rights reserved.</p>
          <div className="mt-2">
            <a href="/about" className="text-white hover:underline mx-2">
              About
            </a>
            <a href="/contact" className="text-white hover:underline mx-2">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;