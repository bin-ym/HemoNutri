import Navbar from '../components/Navbar';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar role={null} />
      <div className="max-w-6xl mx-auto p-6 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-teal-600">Contact Us</h1>
        <p className="text-gray-700">
          Reach out to us at <a href="mailto:support@hemonutri.com" className="text-teal-500 hover:underline">support@hemonutri.com</a> for any questions or support.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;