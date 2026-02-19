import React, { useState } from 'react';

const CategoryPanel = () => {
  const [activeCategory, setActiveCategory] = useState('TYPHOON');

  const categories = ['TYPHOON', 'EARTHQUAKE', 'ERUPTION'];

  return (
    <div className="flex justify-center py-6">
      <div className="bg-gray-400 border-2 border-dark-blue rounded-2xl px-8 py-4 flex gap-4 shadow-md">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-8 py-2 rounded-full border-2 border-dark-blue font-bold uppercase transition ${
              activeCategory === category
                ? 'bg-dark-blue text-white'
                : 'bg-light-blue text-dark-blue hover:bg-opacity-80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPanel;
