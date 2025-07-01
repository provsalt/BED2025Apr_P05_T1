import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/provider/UserContext.js";

export const Home = () => {
  const auth = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* Greeting & Logged-In Info */}
        <SectionCard title="Welcome!" description="Overview of your account and dashboard.">
          <p className="text-sm">Logged in as: <strong>{auth?.id ? auth.id : "Not logged in"}</strong></p>
        </SectionCard>

        <SectionCard title="Recently Scanned Meals" description="View and track your recent meals for nutritional monitoring.">
          <ul className="list-disc ml-6 text-sm">
            <li>Cai Fan – 9:00 AM</li>
            <li>Salad – 12:30 PM</li>
            <li>Stuffed Bowl – 6:45 PM</li>
          </ul>
        </SectionCard>

        <SectionCard title="Upcoming Community Events" description="Join activities and connect with other seniors in your community.">
          <ul className="list-disc ml-6 text-sm">
            <li>Baking Workshop – Tomorrow, 2:00 PM</li>
            <li>Gardening Club – Friday, 10:00 AM</li>
          </ul>
        </SectionCard>

        <SectionCard title="Medical Reminders" description="Your scheduled medication times and health tasks.">
          <ul className="list-disc ml-6 text-sm">
            <li>Blood Pressure Pill – 8:00 AM</li>
            <li>Vitamin D Supplement – 12:00 PM</li>
          </ul>
        </SectionCard>

        <SectionCard title="Nutrition Summary" description="See a breakdown of your daily nutrients and dietary balance.">
          <p className="text-sm">Calories: 1,800 | Protein: 70g | Carbs: 200g | Fats: 60g</p>
        </SectionCard>

        <SectionCard title="Transport Bookmarks" description="Your saved MRT routes or trip plans.">
          <ul className="list-disc ml-6 text-sm">
            <li>To Clinic – Bishan to Farrer Park</li>
            <li>To Library – Clementi to Jurong East</li>
          </ul>
        </SectionCard>

        <SectionCard title="User Profile Info" description="Your current profile details.">
          <p className="text-sm">
            Name: Quing Qurey<br />
            Email: quing@example.com<br />
            Language: English
          </p>
        </SectionCard>

        <SectionCard title="User Settings Quick Links" description="Quick access to update your profile and password.">
          <ul className="list-disc ml-6 text-sm">
            <li><Link to="/settings" className="text-purple-600 hover:underline">Change Password</Link></li>
            <li><Link to="/settings" className="text-purple-600 hover:underline">Update Profile Picture</Link></li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
};

const SectionCard = ({ title, description, children }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-1">{title}</h2>
    <p className="text-sm text-gray-600 mb-3">{description}</p>
    {children}
  </div>
);
