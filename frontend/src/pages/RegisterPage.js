import Navbar from '../components/Navbar';
import Register from '../components/auth/Register';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Join HemoNutri</h1>
          <Register />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;