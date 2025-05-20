import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Register from "../../components/auth/Register";

const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center text-teal-600">
            {t("join_hemonutri")}
          </h1>
          <Register />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;