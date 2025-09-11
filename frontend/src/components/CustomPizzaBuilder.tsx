import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Ingredient, CartItem } from '../types';

interface CustomPizzaBuilderProps {
  token: string;
  addToCart: (item: CartItem) => void;
}

const CustomPizzaBuilder: React.FC<CustomPizzaBuilderProps> = ({ token, addToCart }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [doughs, setDoughs] = useState<Ingredient[]>([]);
  const [crusts, setCrusts] = useState<Ingredient[]>([]);
  const [sauces, setSauces] = useState<Ingredient[]>([]);
  const [cheeses, setCheeses] = useState<Ingredient[]>([]);
  const [toppings, setToppings] = useState<Ingredient[]>([]);
  const [selectedDough, setSelectedDough] = useState<Ingredient | null>(null);
  const [selectedCrust, setSelectedCrust] = useState<Ingredient | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<Ingredient | null>(null);
  const [selectedCheese, setSelectedCheese] = useState<Ingredient | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const ingredientCategory = {
          DO: 'DO',
          CR: 'CR',
          SA: 'SA',
          CH: 'CH',
          TO: 'TO'
        }
        const [doughResponse, crustResponse, sauceResponse, cheeseResponse, toppingResponse] = await Promise.all([
          axios.get(`/api/ingredients/category/${ingredientCategory.DO}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/ingredients/category/${ingredientCategory.CR}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/ingredients/category/${ingredientCategory.SA}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/ingredients/category/${ingredientCategory.CH}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/ingredients/category/${ingredientCategory.TO}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDoughs(doughResponse.data);
        setCrusts(crustResponse.data);
        setSauces(sauceResponse.data);
        setCheeses(cheeseResponse.data);
        setToppings(toppingResponse.data);
        setError('');
      } catch (err: any) {
        setError(t('custom_pizza.error') + ' ' + (err.response?.data || err.message));
      }
    };
    fetchIngredients();
  }, [token, t]);

  const handleAddTopping = (topping: Ingredient) => {
    if (selectedToppings.length >= 5) {
      setError(t('custom_pizza.max_toppings'));
      return;
    }
    if (!selectedToppings.some(t => t.id === topping.id)) {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleRemoveTopping = (toppingId: number) => {
    setSelectedToppings(selectedToppings.filter(t => t.id !== toppingId));
  };

  const handleAddToCart = () => {
    if (!selectedDough || !selectedCrust || !selectedSauce || !selectedCheese) {
      setError(t('custom_pizza.missing_selection'));
      return;
    }
    const ingredients = [selectedDough, selectedCrust, selectedSauce, selectedCheese, ...selectedToppings];
    const price = ingredients.reduce((total, ingredient) => total + ingredient.price, 0);
    const name = `Custom Pizza (${selectedDough.name}, ${selectedCrust.name}, ${selectedSauce.name}, ${selectedCheese.name}${selectedToppings.length > 0 ? ', ' + selectedToppings.map(t => t.name).join(', ') : ''})`;
    const cartItem: CartItem = {
      productId: 0, // Custom pizza has productId 0
      quantity: 1,
      price,
      name,
      ingredients,
      isCustomPizza: true
    };
    addToCart(cartItem);
    navigate('/');
  };

  const calculateTotalPrice = () => {
    const ingredients: Ingredient[] = [selectedDough, selectedCrust, selectedSauce, selectedCheese, ...selectedToppings].filter((i): i is Ingredient => i !== null);
    return ingredients.reduce((total, ingredient) => total + ingredient.price, 0).toFixed(2);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-4xl font-semibold text-gray-800 mb-6 animate-fade-in">{t('custom_pizza.title')}</h2>
      {error && <p className="text-red-500 mb-6 font-medium bg-red-50 p-4 rounded-lg animate-fade-in">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('custom_pizza.dough')}</h3>
          {doughs.map(dough => (
            <div key={dough.id} className="flex items-center mb-2">
              <input
                type="radio"
                name="dough"
                checked={selectedDough?.id === dough.id}
                onChange={() => setSelectedDough(dough)}
                className="mr-2"
              />
              <label>{dough.name} (${dough.price.toFixed(2)})</label>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('custom_pizza.crust')}</h3>
          {crusts.map(crust => (
            <div key={crust.id} className="flex items-center mb-2">
              <input
                type="radio"
                name="crust"
                checked={selectedCrust?.id === crust.id}
                onChange={() => setSelectedCrust(crust)}
                className="mr-2"
              />
              <label>{crust.name} (${crust.price.toFixed(2)})</label>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('custom_pizza.sauce')}</h3>
          {sauces.map(sauce => (
            <div key={sauce.id} className="flex items-center mb-2">
              <input
                type="radio"
                name="sauce"
                checked={selectedSauce?.id === sauce.id}
                onChange={() => setSelectedSauce(sauce)}
                className="mr-2"
              />
              <label>{sauce.name} (${sauce.price.toFixed(2)})</label>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('custom_pizza.cheese')}</h3>
          {cheeses.map(cheese => (
            <div key={cheese.id} className="flex items-center mb-2">
              <input
                type="radio"
                name="cheese"
                checked={selectedCheese?.id === cheese.id}
                onChange={() => setSelectedCheese(cheese)}
                className="mr-2"
              />
              <label>{cheese.name} (${cheese.price.toFixed(2)})</label>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('custom_pizza.toppings')} ({selectedToppings.length}/5)</h3>
          {toppings.map(topping => (
            <div key={topping.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedToppings.some(t => t.id === topping.id)}
                onChange={() => selectedToppings.some(t => t.id === topping.id) ? handleRemoveTopping(topping.id) : handleAddTopping(topping)}
                className="mr-2"
              />
              <label>{topping.name} (${topping.price.toFixed(2)})</label>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-lg font-medium text-gray-700">
          {t('custom_pizza.total_price')}: <span className="text-blue-600">${calculateTotalPrice()}</span>
        </p>
        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white p-3 rounded-lg w-full mt-4 hover:bg-blue-700 transition-colors duration-200"
        >
          {t('custom_pizza.add_to_cart')}
        </button>
      </div>
    </div>
  );
};

export default CustomPizzaBuilder;