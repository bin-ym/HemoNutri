import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Register from "../../components/auth/Register";

const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role={null} />
      <main className="flex items-center justify-center flex-grow px-4 py-8">
        <section className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl animate-fade-in">
          <h1 className="mb-8 text-3xl font-semibold text-center text-blue-600" role="heading" aria-level="1">
            {t("join_hemonutri")}
          </h1>
          <Register />
        </section>
      </main>
      <footer className="py-4 text-sm text-center text-gray-500">
        {t("footer_text", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
};

export default RegisterPage;