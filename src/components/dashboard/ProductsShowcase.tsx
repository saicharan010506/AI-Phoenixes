import React, { useState, useRef, useEffect } from 'react';
import { Plus, Camera, Upload, Eye, DollarSign, Calculator, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stagingViews: string[];
  daysToCreate: number;
  complexity: 'Low' | 'Medium' | 'High';
  materials: string;
  timestamp: Date;
}

const ProductsShowcase: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    images: [],
    stagingViews: [],
    daysToCreate: 1,
    complexity: 'Medium',
    materials: ''
  });
  const [calculatorData, setCalculatorData] = useState({
    materialCost: 0,
    laborHours: 0,
    hourlyRate: 100,
    overheadPercentage: 20,
    profitMargin: 30
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load products from localStorage
    const savedProducts = localStorage.getItem(`kalahasta_products_${user?.id}`);
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      setProducts(parsed.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
    }
  }, [user?.id]);

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem(`kalahasta_products_${user?.id}`, JSON.stringify(newProducts));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setNewProduct(prev => ({
            ...prev,
            images: [...(prev.images || []), imageUrl]
          }));
          
          // Generate staging views
          generateStagingViews(imageUrl);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const generateStagingViews = (imageUrl: string) => {
    // Simulate AI-generated staging views
    const stagingOptions = [
      'Gallery Wall View',
      'Modern Living Room',
      'Boutique Hotel Lobby',
      'Traditional Home Setting',
      'Art Studio Display'
    ];
    
    setNewProduct(prev => ({
      ...prev,
      stagingViews: stagingOptions
    }));
  };

  const calculatePrice = () => {
    const { materialCost, laborHours, hourlyRate, overheadPercentage, profitMargin } = calculatorData;
    
    const laborCost = laborHours * hourlyRate;
    const totalDirectCost = materialCost + laborCost;
    const overheadCost = (totalDirectCost * overheadPercentage) / 100;
    const totalCost = totalDirectCost + overheadCost;
    const finalPrice = totalCost + (totalCost * profitMargin) / 100;
    
    return Math.round(finalPrice);
  };

  const getSuggestedPriceRange = () => {
    const basePrice = calculatePrice();
    const complexity = newProduct.complexity;
    const days = newProduct.daysToCreate || 1;
    
    let multiplier = 1;
    if (complexity === 'High') multiplier = 1.5;
    else if (complexity === 'Low') multiplier = 0.8;
    
    const adjustedPrice = basePrice * multiplier * (days / 7);
    const minPrice = Math.round(adjustedPrice * 0.9);
    const maxPrice = Math.round(adjustedPrice * 1.1);
    
    return { min: minPrice, max: maxPrice, suggested: Math.round(adjustedPrice) };
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.description) {
      alert('Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      description: newProduct.description!,
      price: newProduct.price || getSuggestedPriceRange().suggested,
      images: newProduct.images || [],
      stagingViews: newProduct.stagingViews || [],
      daysToCreate: newProduct.daysToCreate || 1,
      complexity: newProduct.complexity || 'Medium',
      materials: newProduct.materials || '',
      timestamp: new Date()
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    
    // Reset form
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      images: [],
      stagingViews: [],
      daysToCreate: 1,
      complexity: 'Medium',
      materials: ''
    });
    setShowAddProduct(false);
    setShowPriceCalculator(false);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Products & Showcase</h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-2 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-700/50 rounded-lg overflow-hidden">
            {product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-white font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold text-lg">₹{product.price.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">{product.daysToCreate} days</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 mb-4">No products yet. Start showcasing your beautiful creations!</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Days to Create</label>
                  <input
                    type="number"
                    value={newProduct.daysToCreate || 1}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, daysToCreate: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rows={3}
                  placeholder="Describe your artwork"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Complexity</label>
                  <select
                    value={newProduct.complexity || 'Medium'}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, complexity: e.target.value as 'Low' | 'Medium' | 'High' }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Materials Used</label>
                  <input
                    type="text"
                    value={newProduct.materials || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, materials: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Natural dyes, Cotton fabric"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Images</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-white">Upload Files</span>
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span className="text-white">Take Photo</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Image Preview */}
              {newProduct.images && newProduct.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Uploaded Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Staging Views */}
              {newProduct.stagingViews && newProduct.stagingViews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Eye className="inline w-4 h-4 mr-2" />
                    AI-Generated Staging Views
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {newProduct.stagingViews.map((view, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-3 text-center">
                        <span className="text-white text-sm">{view}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Calculator */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Pricing</label>
                  <button
                    onClick={() => setShowPriceCalculator(!showPriceCalculator)}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Price Calculator</span>
                  </button>
                </div>

                {showPriceCalculator && (
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Material Cost (₹)</label>
                        <input
                          type="number"
                          value={calculatorData.materialCost}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, materialCost: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Labor Hours</label>
                        <input
                          type="number"
                          value={calculatorData.laborHours}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, laborHours: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Hourly Rate (₹)</label>
                        <input
                          type="number"
                          value={calculatorData.hourlyRate}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Profit Margin (%)</label>
                        <input
                          type="number"
                          value={calculatorData.profitMargin}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-600 rounded p-3">
                      <p className="text-white text-sm">Calculated Price: <span className="text-yellow-400 font-bold">₹{calculatePrice().toLocaleString()}</span></p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-2">Suggested Price Range:</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-yellow-400 font-bold">₹{getSuggestedPriceRange().min.toLocaleString()} - ₹{getSuggestedPriceRange().max.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    This price reflects the {newProduct.complexity?.toLowerCase()} complexity, {newProduct.materials || 'quality materials'}, and {newProduct.daysToCreate} days of skilled labor.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Final Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.price || getSuggestedPriceRange().suggested}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={addProduct}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsShowcase;