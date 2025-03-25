import Navbar from '../components/Navbar';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold mb-6">About HemoNutri</h1>
        <p className="text-lg text-gray-700 mb-4">
          HemoNutri is a digital tool designed to support hemodialysis patients in managing their nutrition and fluid intake. Built by ours, it empowers patients with personalized meal plans, dietary tracking, and educational resources while enabling healthcare providers and administrators to monitor and support patient care.
        </p>
        <p className="text-gray-600">
          Get started by registering or logging in!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;