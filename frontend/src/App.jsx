import { useState } from "react";

function App() {
  const [data, setData] = useState(null);

  const fetchPrediction = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/predict");
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-6">
        AI Food Calorie Estimator
      </h1>

      <button
        onClick={fetchPrediction}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Get Prediction
      </button>

      {data && (
        <div className="mt-6">
          <p>Food: {data.food}</p>
          <p>Calories: {data.calories}</p>
        </div>
      )}
    </div>
  );
}

export default App;
