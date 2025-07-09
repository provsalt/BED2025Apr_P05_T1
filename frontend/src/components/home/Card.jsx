export const Card = ({ title, content }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-2 text-purple-700">{title}</h2>
    {content && content.length > 0 ? (
      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
        {content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-400 italic">No data available.</p>
    )}
  </div>
);
