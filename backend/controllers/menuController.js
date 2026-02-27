// Food menu with categories and prices
const foodMenu = {
  breakfast: [
    { name: 'Tea', price: 20 },
    { name: 'Coffee', price: 30 },
    { name: 'Toast & Butter', price: 50 },
    { name: 'Eggs (2)', price: 40 },
    { name: 'Idli (3)', price: 60 },
    { name: 'Dosa', price: 80 },
    { name: 'Paratha', price: 50 },
    { name: 'Cereal & Milk', price: 45 }
  ],
  lunch: [
    { name: 'Biryani (Veg)', price: 150 },
    { name: 'Biryani (Chicken)', price: 180 },
    { name: 'Butter Chicken', price: 200 },
    { name: 'Dal Makhani', price: 120 },
    { name: 'Vegetable Curry', price: 100 },
    { name: 'Roti (4)', price: 40 },
    { name: 'Rice (1 plate)', price: 50 },
    { name: 'Paneer Tikka', price: 140 }
  ],
  dinner: [
    { name: 'Biryanis & Rice', price: 150 },
    { name: 'Tandoori Chicken', price: 200 },
    { name: 'Fish Curry', price: 220 },
    { name: 'Mutter Paneer', price: 130 },
    { name: 'Mixed Vegetable', price: 110 },
    { name: 'Roti (4)', price: 40 },
    { name: 'Naan (2)', price: 60 },
    { name: 'Dessert (Kheer)', price: 80 }
  ]
};

exports.getMenu = (req, res) => {
  res.json(foodMenu);
};

exports.getMenuByCategory = (req, res) => {
  const { category } = req.params;
  if (!foodMenu[category]) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json({ category, items: foodMenu[category] });
};
