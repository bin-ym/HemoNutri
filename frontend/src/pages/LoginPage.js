import Navbar from '../components/Navbar';
import Login from '../components/auth/Login';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to HemoNutri</h1>
          <Login />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;