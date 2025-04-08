import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';
import MyEditor from './WordPressEditor';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddProductForm = () => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [contractFile, setContractFile] = useState(null);
  const editorRef = useRef(null);
  
  const initialProductData = {
    stuffname: '',
    short_description: '',
    state: 'new',
    rental_location: 'Tunis',
    price_per_day: '',
    availability: 'Available',
    detailed_description: '',
    location: 'Tunis City Center',
    category: {
      name: '',
      subcategory: ''
    },
    brand: '',
    equipment_images: [],
    user: 2,
    stuff_management: {
      name: '',
      last_maintenance: '',
      condition: 'good',
      rental_location: 'Tunis',
      deposit: '',
      availability: 'Available',
      rental_zone: 'North',
      location: 'Tunis City Center',
      contract_required: '',
    }
  };

  const [productData, setProductData] = useState(initialProductData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const categories = ["Electronics", "Clothing", "Furniture", "Tools"];
  const subCategories = {
    "Electronics": ["Laptops", "Phones", "Speakers", "Cameras"],
    "Clothing": ["Shirts", "Pants", "Jackets", "Shoes"],
    "Furniture": ["Chairs", "Tables", "Sofas", "Beds"],
    "Tools": ["Power Tools", "Hand Tools", "Garden Tools"]
  };
  const states = ["new", "used", "refurbished"];
  const conditions = ["excellent", "good", "fair", "poor"];
  const availabilityOptions = ["Available", "Unavailable", "Coming Soon"];

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError('You can upload a maximum of 6 images');
      return;
    }

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      alt: `Image ${images.length + index + 1}`,
      position: images.length + index + 1
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
    setError(null);
  };

  const handleContractUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type and size
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      
      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setContractFile(file);
      setError(null);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      position: idx + 1
    }));
    setImages(updatedImages);
  };

  const updateImageAltText = (index, alt) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      alt
    };
    setImages(newImages);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProductData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!productData.stuffname || !productData.short_description) {
      setError('Please fill all required fields');
      return false;
    }
    
    if (!images.length) {
      setError('Please upload at least one image');
      return false;
    }
    
    if (!productData.price_per_day || isNaN(productData.price_per_day)) {
      setError('Please enter a valid price');
      return false;
    }
    
    if (!productData.category.name || !productData.category.subcategory) {
      setError('Please select both category and subcategory');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (editorRef.current) {
      const htmlContent = editorRef.current.getHTML();
      setDescription(htmlContent);
    }
  
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Prepare the JSON data structure that matches your serializer
      const requestData = {
        stuffname: productData.stuffname,
        short_description: productData.short_description,
        state: productData.state,
        rental_location: productData.rental_location,
        price_per_day: productData.price_per_day,
        detailed_description: description,
        location: productData.location,
        brand: productData.brand,
        user: productData.user,
        
        // Nested category data
        category: {
          name: productData.category.name,
          subcategory: productData.category.subcategory
        },
        
        // Nested stuff_management data
        stuff_management: {
          name: productData.stuff_management.name,
          last_maintenance: productData.stuff_management.last_maintenance,
          condition: productData.stuff_management.condition,
          rental_location: productData.stuff_management.rental_location,
          deposit: productData.stuff_management.deposit,
          availability: productData.stuff_management.availability,
          rental_zone: productData.stuff_management.rental_zone,
          location: productData.stuff_management.location,
          contract_required: productData.stuff_management.contract_required
        },
        
        // Array of equipment images
        equipment_images: images.map((img, index) => ({
          image: img.file, // This assumes img.file is a File object - you'll need to handle this differently
          alt: img.alt,
          position: img.position || index
        }))
      };
  
      // For file uploads, you still need FormData
      if (images.length > 0) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(requestData));
        
        // Append each image file separately
        images.forEach((img, index) => {
          formData.append(`equipment_images_${index}`, img.file);
        });
  
        const response = await axios.post('http://127.0.0.1:8000/api/stuffs/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.status === 201) {
          toast.success('Product added successfully!');
          // Reset form
          setProductData(initialProductData);
          setImages([]);
          setDescription('');
          if (editorRef.current) {
            editorRef.current.clearContent();
          }
        }
      } else {
        // If no images, send as pure JSON
        const response = await axios.post('http://127.0.0.1:8000/api/stuffs/', requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status === 201) {
          toast.success('Product added successfully!');
          // Reset form
          setProductData(initialProductData);
          setImages([]);
          setDescription('');
          if (editorRef.current) {
            editorRef.current.clearContent();
          }
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to create product';
      if (error.response) {
        if (error.response.data) {
          errorMessage = Object.values(error.response.data).flat().join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">Add New Product</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      name="stuffname"
                      value={productData.stuffname}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                    <input
                      type="text"
                      name="short_description"
                      value={productData.short_description}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <select
                        name="state"
                        value={productData.state}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {states.map(state => (
                          <option key={state} value={state}>{state.charAt(0).toUpperCase() + state.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rental Location *</label>
                      <input
                        type="text"
                        name="rental_location"
                        value={productData.rental_location}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                    <MyEditor 
                      ref={editorRef}
                      content={description}
                      onChange={(html) => setDescription(html)}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Pricing
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (DT) *</label>
                    <input
                      type="number"
                      name="price_per_day"
                      value={productData.price_per_day}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                    <select
                      name="availability"
                      value={productData.availability}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {availabilityOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Product Images */}
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Product Images
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-md border border-gray-200"
                        />
                        <div className="mt-1">
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(e) => updateImageAltText(index, e.target.value)}
                            className="block w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="Image description"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {images.length < 6 && (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors h-32"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FiUpload className="text-gray-400 mb-2" size={24} />
                        <span className="text-sm text-gray-500">Upload Image</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  {images.length > 0 && (
                    <p className="text-xs text-gray-500">You can add up to 6 images. Click on the X to remove an image.</p>
                  )}
                </div>
              </div>

              {/* Category & Brand */}
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Category & Brand
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category.name"
                      value={productData.category.name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {productData.category.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory *</label>
                      <select
                        name="category.subcategory"
                        value={productData.category.subcategory}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select subcategory</option>
                        {subCategories[productData.category.name]?.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={productData.brand}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Management Info */}
              <div className="bg-white rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Management Information
                </h2>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        name="stuff_management.condition"
                        value={productData.stuff_management.condition}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (DT)</label>
                      <input
                        type="number"
                        name="stuff_management.deposit"
                        value={productData.stuff_management.deposit}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance</label>
                    <input
                      type="date"
                      name="stuff_management.last_maintenance"
                      value={productData.stuff_management.last_maintenance}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rental Zone</label>
                      <input
                        type="text"
                        name="stuff_management.rental_zone"
                        value={productData.stuff_management.rental_zone}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contract Required</label>
                      <div className="mt-1 flex items-center">
                        {contractFile ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">{contractFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setContractFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span>Upload Contract</span>
                            <input
                              type="file"
                              onChange={handleContractUpload}
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        )}
                      </div>
                      {contractFile && (
                        <p className="mt-1 text-xs text-gray-500">
                          PDF or Word document (max 5MB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-2 bg-red-50 border-t border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;