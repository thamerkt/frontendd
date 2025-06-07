import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX, FiPlus, FiBox, FiDollarSign, FiImage, FiLayers, FiSettings, FiFileText, FiEye, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import MyEditor from './WordPressEditor';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie"

const states = ["new", "used", "refurbished"];
const conditions = ["excellent", "good", "fair", "poor"];
const availabilityOptions = ["Available", "Unavailable", "Coming Soon"];

const AddProductForm = () => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [contractFile, setContractFile] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    images: true,
    pricing: true,
    category: true,
    management: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories/', {
          headers: {
            'Content-Type': 'application/json',

          },
          withCredentials: true, // This sends cookies with the request
        });
        setCategories(response.data);
        setLoadingCategories(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);




  const fetchSubCategories = async (categoryId) => {
    try {
      setLoadingSubCategories(true);
      const response = await axios.get(`http://localhost:8000/api/subcatgeory/`, {
        headers: {
          'Content-Type': 'application/json',

        }, withCredentials: true, // This sends cookies with the request
      });
      // Filter subcategories by the selected category
      const filteredSubCategories = response.data.filter(sub => sub.category == categoryId);
      setSubCategories(filteredSubCategories);
      setLoadingSubCategories(false);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setLoadingSubCategories(false);
    }
  };

  const handleImageUploadd = async (file) => {
    try {
      if (!file) return null;

      const imageId = Math.random().toString(36).substring(2, 9);

      return {
        src: URL.createObjectURL(file),
        id: imageId,
        file: file,
        alt: file.name,
        title: file.name
      };
    } catch (error) {
      console.error("Error handling image upload:", error);
      toast.error("Image handling failed. Please try again.");
      throw error;
    }
  };

  const handleImageDelete = async (imageId, imageUrl) => {
    await fetch(`http://localhost:8000/api/images/${imageId}`, {
      method: 'DELETE'
    });
  };

  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      console.log('Saved content:', html);
      const images = editorRef.current.getUploadedImages();
      console.log('Associated images:', images);
    }
  };

  const initialProductData = {
    stuffname: '',
    short_description: '',
    state: 'new',
    name: "test",
    rental_location: 'Tunis',
    price_per_day: '',
    availability: 'Available',
    detailed_description: '',
    location: 'Tunis City Center',
    category: {
      id: '',
      subcategory_id: ''
    },
    brand: '',
    equipment_images: [],
    user: Cookies.get('keycloak_user_id'),
    stuff_management: {
      name: 'test',
      last_maintenance: '',
      condition: 'good',
      rental_location: 'Tunis',
      deposit: '',
      availability: 'Available',
      rental_zone: 'North',
      location: 'Tunis City Center',
    }
  };

  const [productData, setProductData] = useState(initialProductData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
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
    setImages(prev => [...prev, ...newImages]);
    setError(null);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    const updatedImages = newImages.map((img, idx) => ({ ...img, position: idx + 1 }));
    setImages(updatedImages);
  };

  const updateImageAltText = (index, alt) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt };
    setImages(newImages);
  };

  const handleContractUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContractFile(file);
      console.log("Contract file selected:", file.name);
    } else {
      console.log("No file selected");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category.id') {
      // When category changes, fetch its subcategories
      setProductData(prev => ({
        ...prev,
        category: {
          ...prev.category,
          id: value,
          subcategory_id: '' // Reset subcategory when category changes
        }
      }));
      fetchSubCategories(value);
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProductData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProductData(prev => ({ ...prev, [name]: value }));
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
    if (!productData.category.id || !productData.category.subcategory_id) {
      setError('Please select both category and subcategory');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let stuffManagementId;
      try {
        const managementFormData = new FormData();
        managementFormData.append('name', 'test');
        managementFormData.append('last_maintenance', productData.stuff_management.last_maintenance || '');
        managementFormData.append('condition', productData.stuff_management.condition);
        managementFormData.append('rental_location', productData.stuff_management.rental_location);
        managementFormData.append('deposit', productData.stuff_management.deposit || '');
        managementFormData.append('availability', productData.stuff_management.availability);
        managementFormData.append('rental_zone', productData.stuff_management.rental_zone);
        managementFormData.append('location', productData.stuff_management.location);
        for (let pair of managementFormData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
          
        }


        if (contractFile) {
          managementFormData.append('contract_required', contractFile);
        }

        const managementRes = await axios.post(
          'http://localhost:8000/api/stuffmanagment/',
          managementFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
              'Authorization': `Bearer ${Cookies.get('access_token')}`
            }
          }
        );

        if (managementRes.data && managementRes.data.id) {
          stuffManagementId = managementRes.data.id;
        } else {
          throw new Error("Invalid response from server when creating stuff management");
        }
      } catch (err) {
        throw new Error("Failed to create stuff management: " + extractErrorMsg(err));
      }

      let stuffId;
      try {
        const stuffFormData = new FormData();
        stuffFormData.append('stuffname', productData.stuffname);
        stuffFormData.append('short_description', productData.short_description);
        stuffFormData.append('state', productData.state);
        stuffFormData.append('rental_location', productData.rental_location);
        stuffFormData.append('price_per_day', productData.price_per_day);

        if (editorRef.current) {
          console.log('hi')
          const html = editorRef.current.getHTML();
          stuffFormData.append('detailed_description', html);
        }

        stuffFormData.append('location', productData.stuff_management.location);
        stuffFormData.append('category', productData.category.id);
        stuffFormData.append('subcategory', productData.category.subcategory_id);
        stuffFormData.append('brand', productData.brand);
        stuffFormData.append('stuff_management', stuffManagementId);
        stuffFormData.append('user', productData.user);

        const stuffRes = await axios.post('http://localhost:8000/api/stuffs/', stuffFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${Cookies.get('access_token')}`
          },
        });

        stuffId = stuffRes.data.id;
      } catch (err) {
        throw new Error("Failed to create stuff: " + extractErrorMsg(err));
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgFormData = new FormData();
        imgFormData.append('stuff', stuffId);
        imgFormData.append('url', img.file);
        imgFormData.append('alt', img.alt || '');
        imgFormData.append('position', Number.isInteger(img.position) ? img.position : i);

        try {
          await axios.post('http://localhost:8000/api/images/', imgFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${Cookies.get('access_token')}`
            },
          });
        } catch (imgErr) {
          console.error(`Failed to upload image ${i + 1}:`, imgErr);
        }
      }

      if (editorRef.current) {
        const editorImages = editorRef.current.getUploadedImages();
        for (const img of editorImages) {
          if (img.file) {
            const imgFormData = new FormData();
            imgFormData.append('stuff', stuffId);
            imgFormData.append('url', img.file);
            imgFormData.append('alt', img.alt || '');
            imgFormData.append('position', 0);

            try {
              await axios.post('http://localhost:8000/api/images/', imgFormData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${Cookies.get('access_token')}`
                },
              });
            } catch (imgErr) {
              console.error(`Failed to upload editor image:`, imgErr);
            }
          }
        }
      }

      toast.success('Product added successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      resetForm();

    } catch (error) {
      console.error(error);
      setError(error.message || 'Something went wrong.');
      toast.error(error.message || 'Failed to add product', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractErrorMsg = (error) => {
    if (error.response) {
      if (error.response.headers['content-type']?.includes('text/html')) {
        return "Server returned an HTML error page (likely a 500 error)";
      }

      if (error.response.data) {
        if (typeof error.response.data === 'object') {
          return Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('; ');
        }
        return error.response.data.toString();
      }
    }
    return error.message || 'Unknown error occurred';
  };

  const resetForm = () => {
    setProductData(initialProductData);
    setImages([]);
    setDescription('');
    setContractFile(null);
    if (editorRef.current) editorRef.current.clearContent();
    setShowPreview(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="flex items-center mb-8">
          <div className="p-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 text-white mr-3 shadow-md">
            <FiBox size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                Add New Product
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to list your product for rental</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} ref={formRef} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-teal-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                  onClick={() => toggleSection('basic')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mr-3 shadow-sm">
                      <FiFileText size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                  </div>
                  {expandedSections.basic ? (
                    <FiChevronDown className="text-gray-500 transition-transform duration-200" />
                  ) : (
                    <FiChevronRight className="text-gray-500 transition-transform duration-200" />
                  )}
                </div>

                {expandedSections.basic && (
                  <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                        <input
                          type="text"
                          name="stuffname"
                          value={productData.stuffname}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                          required
                          placeholder="Enter product name"
                        />
                      </div>

                      <div className="space-y-1 relative">
                        <label className="block text-sm font-medium text-gray-700">State *</label>
                        <select
                          name="state"
                          value={productData.state}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm appearance-none pr-7"
                          required
                        >
                          {states.map(state => (
                            <option key={state} value={state}>{state.charAt(0).toUpperCase() + state.slice(1)}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-[34px] w-4 h-4 rounded-full bg-black flex items-center justify-center pointer-events-none">
                          <FiChevronDown className="text-white" size={10} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Short Description *</label>
                      <textarea
                        name="short_description"
                        value={productData.short_description}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                        required
                        rows={2}
                        placeholder="Brief description of your product"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Detailed Description *</label>
                      <MyEditor ref={editorRef} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Rental Location *</label>
                        <input
                          type="text"
                          name="rental_location"
                          value={productData.rental_location}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                          required
                          placeholder="Where is the product located?"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Location Details</label>
                        <input
                          type="text"
                          name="stuff_management.location"
                          value={productData.stuff_management.location}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                          placeholder="Specific location details"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Pricing Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-teal-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                  onClick={() => toggleSection('pricing')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mr-3 shadow-sm">
                      <FiDollarSign size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Pricing</h2>
                  </div>
                  {expandedSections.pricing ? (
                    <FiChevronDown className="text-gray-500 transition-transform duration-200" />
                  ) : (
                    <FiChevronRight className="text-gray-500 transition-transform duration-200" />
                  )}
                </div>

                {expandedSections.pricing && (
                  <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Price Per Day (DT) *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">DT</span>
                          </div>
                          <input
                            type="number"
                            name="price_per_day"
                            value={productData.price_per_day}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Deposit (DT)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">DT</span>
                          </div>
                          <input
                            type="number"
                            name="stuff_management.deposit"
                            value={productData.stuff_management.deposit}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                            min="0"
                            step="0.01"
                            placeholder="Optional deposit amount"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 relative">
                        <label className="block text-sm font-medium text-gray-700">Availability *</label>
                        <select
                          name="availability"
                          value={productData.availability}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm appearance-none pr-7"
                          required
                        >
                          {availabilityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-[34px] w-4 h-4 rounded-full bg-black flex items-center justify-center pointer-events-none">
                          <FiChevronDown className="text-white" size={10} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Rental Zone</label>
                        <input
                          type="text"
                          name="stuff_management.rental_zone"
                          value={productData.stuff_management.rental_zone}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                          placeholder="Zone for rental service"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Management Information Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-teal-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                  onClick={() => toggleSection('management')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mr-3 shadow-sm">
                      <FiSettings size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Management Information</h2>
                  </div>
                  {expandedSections.management ? (
                    <FiChevronDown className="text-gray-500 transition-transform duration-200" />
                  ) : (
                    <FiChevronRight className="text-gray-500 transition-transform duration-200" />
                  )}
                </div>

                {expandedSections.management && (
                  <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 relative">
                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                        <select
                          name="stuff_management.condition"
                          value={productData.stuff_management.condition}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm appearance-none pr-7"
                        >
                          {conditions.map(condition => (
                            <option key={condition} value={condition}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-[34px] w-4 h-4 rounded-full bg-black flex items-center justify-center pointer-events-none">
                          <FiChevronDown className="text-white" size={10} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Last Maintenance</label>
                        <input
                          type="date"
                          name="stuff_management.last_maintenance"
                          value={productData.stuff_management.last_maintenance}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Contract Required</label>
                      <div className="mt-1">
                        {contractFile ? (
                          <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50 transition-all hover:bg-gray-100">
                            <div className="flex items-center">
                              <FiFileText className="text-teal-600 mr-2 text-sm" />
                              <span className="text-sm text-gray-700 truncate max-w-xs">{contractFile.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setContractFile(null)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-teal-500 transition-all hover:bg-teal-50">
                            <FiUpload className="text-gray-400 mb-1.5" size={20} />
                            <span className="text-xs text-gray-600">Upload Contract Document</span>
                            <span className="text-xxs text-gray-400 mt-0.5">PDF or Word document (max 5MB)</span>
                            <input
                              type="file"
                              onChange={handleContractUpload}
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Images and Category */}
            <div className="space-y-6">
              {/* Product Images Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-teal-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                  onClick={() => toggleSection('images')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mr-3 shadow-sm">
                      <FiImage size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Product Images</h2>
                  </div>
                  {expandedSections.images ? (
                    <FiChevronDown className="text-gray-500 transition-transform duration-200" />
                  ) : (
                    <FiChevronRight className="text-gray-500 transition-transform duration-200" />
                  )}
                </div>

                {expandedSections.images && (
                  <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />

                    {/* Main/Principal Photo Display */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Principal Photo *
                        <span className="ml-1 text-xs text-gray-500">(Required)</span>
                      </label>
                      <div className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square w-full">
                        {images[0] ? (
                          <>
                            <img
                              src={images[0].preview}
                              alt="Main product"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onLoad={() => URL.revokeObjectURL(images[0].preview)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(0);
                                }}
                                className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                                aria-label="Remove main image"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="w-full h-full flex flex-col items-center justify-center hover:bg-teal-50 transition-colors"
                          >
                            <FiUpload className="text-gray-400 mb-2" size={24} />
                            <span className="text-sm text-gray-600">Click to upload main photo</span>
                            <span className="text-xs text-gray-400 mt-1">JPEG, PNG (max 5MB)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Photos
                        <span className="ml-1 text-xs text-gray-500">(Max 4, optional)</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, index) => (
                          <div key={`thumbnail-${index}`} className="relative aspect-square">
                            {images[index + 1] ? (
                              <>
                                <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={images[index + 1].preview}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onLoad={() => URL.revokeObjectURL(images[index + 1].preview)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index + 1)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                  aria-label={`Remove image ${index + 2}`}
                                >
                                  <FiX size={12} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-white/90">
                                  <input
                                    type="text"
                                    value={images[index + 1].alt}
                                    onChange={(e) => updateImageAltText(index + 1, e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    placeholder="Image description"
                                  />
                                </div>
                              </>
                            ) : images.length < 5 && (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-colors"
                                disabled={images.length >= 5}
                              >
                                <FiUpload className="text-gray-400" size={16} />
                                <span className="text-xs text-gray-500 mt-1">Add photo</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Help text */}
                    <p className="text-xs text-gray-500">
                      {images.length > 0 ? (
                        <>
                          <span className="font-medium">Tip:</span> First image is your main display photo. You can upload up to 5 images total.
                        </>
                      ) : (
                        "Upload at least one photo to continue. The first image will be used as the main display photo."
                      )}
                    </p>

                    {/* Error message */}
                    {error && (
                      <p className="text-xs text-red-500">{error}</p>
                    )}
                  </div>
                )}
              </div>           {/* Category & Brand Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-teal-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                  onClick={() => toggleSection('category')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mr-3 shadow-sm">
                      <FiLayers size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Category & Brand</h2>
                  </div>
                  {expandedSections.category ? (
                    <FiChevronDown className="text-gray-500 transition-transform duration-200" />
                  ) : (
                    <FiChevronRight className="text-gray-500 transition-transform duration-200" />
                  )}
                </div>

                {expandedSections.category && (
                  <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                    <div className="space-y-1 relative">
                      <label className="block text-sm font-medium text-gray-700">Category *</label>
                      <select
                        name="category.id"
                        value={productData.category.id}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm appearance-none pr-7"
                        required
                        disabled={loadingCategories}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-[34px] w-4 h-4 rounded-full bg-black flex items-center justify-center pointer-events-none">
                        <FiChevronDown className="text-white" size={10} />
                      </div>
                      {loadingCategories && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                        </div>
                      )}
                    </div>

                    {productData.category.id && (
                      <div className="space-y-1 relative">
                        <label className="block text-sm font-medium text-gray-700">Subcategory *</label>
                        <select
                          name="category.subcategory_id"
                          value={productData.category.subcategory_id}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm appearance-none pr-7"
                          required
                          disabled={loadingSubCategories || subCategories.length === 0}
                        >
                          <option value="">Select subcategory</option>
                          {subCategories.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-[34px] w-4 h-4 rounded-full bg-black flex items-center justify-center pointer-events-none">
                          <FiChevronDown className="text-white" size={10} />
                        </div>
                        {loadingSubCategories && (
                          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={productData.brand}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                        placeholder="Product brand (optional)"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            {error && (
              <div className="mb-3 sm:mb-0 w-full sm:w-auto animate-fadeIn">
                <p className="text-red-600 text-xs sm:text-sm">{error}</p>
              </div>
            )}
            <div className="flex space-x-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={togglePreview}
                className="px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all flex items-center hover:shadow-md"
              >
                <FiEye className="mr-1.5" size={14} />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-1.5" size={14} />
                    Publish Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Add these styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddProductForm;
