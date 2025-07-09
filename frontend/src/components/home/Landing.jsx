export const Landing = () => (
  <div className="flex flex-col items-center justify-center text-center space-y-6 py-28">
    <h1 className="text-5xl font-extrabold text-purple-800">Welcome to ElderCare</h1>
    <p className="text-gray-600 max-w-xl text-lg">
      Supporting seniors with medical reminders, nutrition tracking, transport planning, and community events.
    </p>
    <div className="space-x-6 flex items-center">
      <a
        href="/login"
        className="bg-purple-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-800 transition"
      >
        Login
      </a>
      <a
        href="/signUp"
        className="relative text-purple-700 font-medium after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-purple-500 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300"
      >
        Create an Account
      </a>
    </div>
  </div>
);
