import Navbar from '../components/Navbar';
import Register from '../components/auth/Register';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role={null} />
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-teal-600">Join HemoNutri</h1>
          <Register />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;