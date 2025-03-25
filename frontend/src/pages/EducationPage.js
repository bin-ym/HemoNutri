import Navbar from '../components/Navbar';
import Education from '../components/patient/Education';

const EducationPage = () => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <Navbar role="patient" />
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Educational Resources</h1>
      <Education />
    </div>
  </div>
);

export default EducationPage;