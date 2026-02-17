import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, Heart, Clock, Star, Filter, TrendingUp, Award, Flame } from 'lucide-react';

const RecipeDashboard = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [bookmarked, setBookmarked] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    { name: 'Healthy', icon: '🥗', query: 'salad' },
    { name: 'Italian', icon: '🍝', query: 'pasta' },
    { name: 'Spicy', icon: '🌶️', query: 'curry' },
    { name: 'Desserts', icon: '🍰', query: 'dessert' },
    { name: 'Breakfast', icon: '🍳', query: 'breakfast' },
    { name: 'Asian', icon: '🍜', query: 'chicken' },
  ];

  const filters = [
    { id: 'all', label: 'All Dishes', icon: Filter },
    { id: 'quick', label: 'Quick Meals', icon: Clock },
    { id: 'rated', label: 'Top Rated', icon: Award },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedRecipes');
    if (saved) setBookmarked(JSON.parse(saved));
    fetchRecipes('chicken');
  }, []);

  const fetchRecipes = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await response.json();
      if (data.meals) {
        const enrichedMeals = data.meals.map(meal => ({
          ...meal,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          time: Math.floor(Math.random() * 40 + 15),
          veg: Math.random() > 0.5,
          trending: Math.random() > 0.7
        }));
        setRecipes(enrichedMeals);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      fetchRecipes(searchTerm);
      setSelectedCategory('All');
    }
  };

  const toggleBookmark = (recipeId) => {
    const newBookmarked = bookmarked.includes(recipeId)
      ? bookmarked.filter(id => id !== recipeId)
      : [...bookmarked, recipeId];
    setBookmarked(newBookmarked);
    localStorage.setItem('bookmarkedRecipes', JSON.stringify(newBookmarked));
  };

  const filterRecipes = (recipes) => {
    let filtered = recipes;
    
    if (activeFilter === 'quick') {
      filtered = filtered.filter(r => r.time <= 25);
    } else if (activeFilter === 'rated') {
      filtered = filtered.filter(r => parseFloat(r.rating) >= 4.2);
    } else if (activeFilter === 'trending') {
      filtered = filtered.filter(r => r.trending);
    }
    
    return filtered;
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  const RecipeCard = ({ recipe }) => {
    const isBookmarked = bookmarked.includes(recipe.idMeal);
    
    return (
      <div 
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative"
        onClick={() => setSelectedRecipe(recipe)}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={recipe.strMealThumb} 
            alt={recipe.strMeal}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{recipe.rating}</span>
          </div>
          {recipe.trending && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Trending
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(recipe.idMeal);
            }}
            className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart 
              className={`w-5 h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {recipe.strMeal}
          </h3>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                {recipe.time} min
              </span>
              <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-xs font-medium">
                {recipe.strCategory}
              </span>
            </div>
            {recipe.veg && (
              <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RecipeDetail = ({ recipe, onClose }) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (recipe[`strIngredient${i}`]) {
        ingredients.push({
          ingredient: recipe[`strIngredient${i}`],
          measure: recipe[`strMeasure${i}`]
        });
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img 
              src={recipe.strMealThumb} 
              alt={recipe.strMeal}
              className="w-full h-64 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{recipe.rating}</span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{recipe.strMeal}</h2>
            
            <div className="flex gap-3 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                {recipe.strCategory}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {recipe.strArea}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                {recipe.time} min
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Ingredients</h3>
              <div className="grid grid-cols-2 gap-2">
                {ingredients.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {item.measure} {item.ingredient}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">Instructions</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {recipe.strInstructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredRecipes = filterRecipes(recipes);

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <MapPin className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Deliver to</p>
                <p className="font-semibold text-gray-800">Home - Mumbai</p>
              </div>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for dishes, ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Cravings Carousel */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">What's on your mind?</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name);
                  fetchRecipes(category.query);
                }}
                className={`flex flex-col items-center gap-2 min-w-fit transition-transform hover:scale-110 ${
                  selectedCategory === category.name ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg ${
                  selectedCategory === category.name 
                    ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                    : 'bg-white'
                }`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeFilter === filter.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Recipe Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeFilter !== 'all' ? filters.find(f => f.id === activeFilter)?.label : 'Recommended Recipes'}
            </h2>
            <span className="text-sm text-gray-500">{filteredRecipes.length} dishes</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))}
            </div>
          )}
        </div>

        {/* Bookmarked Section */}
        {bookmarked.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              Your Favorites ({bookmarked.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.filter(r => bookmarked.includes(r.idMeal)).map(recipe => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecipeDashboard;