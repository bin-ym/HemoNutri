const MealPlan = () => {
    const mealPlan = [
      { meal: 'Breakfast', food: 'Teff porridge', amount: '200g' },
      { meal: 'Lunch', food: 'Injera with lentils', amount: '300g' },
      { meal: 'Dinner', food: 'Vegetable stew', amount: '250g' },
    ];
  
    return (
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Sample Meal Plan</h2>
        <ul className="space-y-2">
          {mealPlan.map((item, index) => (
            <li key={index} className="text-gray-700">
              <span className="font-medium">{item.meal}:</span> {item.food} - {item.amount}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default MealPlan;