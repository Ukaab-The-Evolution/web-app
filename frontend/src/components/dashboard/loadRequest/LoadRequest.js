import { useState, useRef, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import ProfileHeader from '../../ui/ProfileHeader';
import Toast from "../../ui/Toast";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const LoadRequest = ({ user }) => {
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    cargoType: '',
    loadWeight: '',
    numberOfTrucks: 1,
    origin: '',
    destination: '',
    paymentOffer: '',
    poolingAllowed: 'Yes',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.cargoType.trim()) {
      setToast({
        type: "error",
        message: "Cargo type is required.",
      });
      return false;
    }
    if (!formData.loadWeight.trim()) {
      setToast({
        type: "error",
        message: "Load weight is required.",
      });
      return false;
    }
    if (formData.numberOfTrucks < 1) {
      setToast({
        type: "error",
        message: "Number of trucks must be at least 1.",
      });
      return false;
    }
    if (!formData.origin.trim()) {
      setToast({
        type: "error",
        message: "Origin is required.",
      });
      return false;
    }
    if (!formData.destination.trim()) {
      setToast({
        type: "error",
        message: "Destination is required.",
      });
      return false;
    }
    if (!formData.paymentOffer.trim()) {
      setToast({
        type: "error",
        message: "Payment offer is required.",
      });
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberOfTrucksChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      numberOfTrucks: Math.max(1, prev.numberOfTrucks + increment)
    }));
  };

  const handlePoolingChange = (value) => {
    setFormData(prev => ({
      ...prev,
      poolingAllowed: value
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      // implement API call here
      console.log('Load request data:', formData);
      setToast({
        type: "success",
        message: "Load request submitted successfully!",
      });
      
      setFormData({
        cargoType: '',
        loadWeight: '',
        numberOfTrucks: 1,
        origin: '',
        destination: '',
        paymentOffer: '',
        poolingAllowed: 'Yes',
        additionalNotes: ''
      });
    } catch (error) {
      setToast({
        type: "error",
        message: "Failed to submit load request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <ProfileHeader
        userName={user?.full_name || "Ahmed"}
        title="Load Request"
        subtitle="Submit your New Load Request here!"
        userAvatar={user?.avatar_url}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-1">
        <div className="bg-white rounded-xl p-6">
          
          {/* Shipment Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#A3A3A3] mb-6">Shipment Details</h3>
            
            {/* Cargo Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Cargo Type
              </label>
              <input
                type="text"
                name="cargoType"
                value={formData.cargoType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255]"
                placeholder="Frozen Goods"
              />
            </div>

            {/* Load Weight and Number of Trucks Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Load Weight
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="loadWeight"
                    value={formData.loadWeight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255] pr-20"
                    placeholder="200"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#3B6255] text-sm">
                    kg/tons
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Number of Trucks
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleNumberOfTrucksChange(-1)}
                    className="w-10 h-12 rounded-l-lg flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    name="numberOfTrucks"
                    value={formData.numberOfTrucks}
                    onChange={handleInputChange}
                    min="1"
                    className="flex-1 px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-center text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255]"
                  />
                  <button
                    type="button"
                    onClick={() => handleNumberOfTrucksChange(1)}
                    className="w-10 h-12 rounded-r-lg flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#A3A3A3] mb-6">Location Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255]"
                  placeholder="Islamabad"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255]"
                  placeholder="Karachi"
                />
              </div>
            </div>
          </div>

          {/* Payment & Preferences Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#A3A3A3] mb-6">Payment & Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Payment Offer
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    Rs.
                  </span>
                  <input
                    type="text"
                    name="paymentOffer"
                    value={formData.paymentOffer}
                    onChange={handleInputChange}
                    className="w-full px-12 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255]"
                    placeholder="20000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Pooling Allowed
                </label>
                <div className="flex items-center gap-20">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="poolingAllowed"
                      value="Yes"
                      checked={formData.poolingAllowed === 'Yes'}
                      onChange={() => handlePoolingChange('Yes')}
                      className="w-4 h-4 text-[#3B6255] bg-[#E8F2EE] border border-1 border-[#578C7A] focus:ring-[#3B6255] focus:ring-1"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="poolingAllowed"
                      value="No"
                      checked={formData.poolingAllowed === 'No'}
                      onChange={() => handlePoolingChange('No')}
                      className="w-4 h-4 text-[#3B6255] bg-[#E8F2EE] border border-1 border-[#578C7A] focus:ring-[#3B6255] focus:ring-1"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#A3A3A3] mb-6">Additional Information</h3>
            
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-4 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255] resize-none"
              placeholder="Add any special notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
              shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-medium text-white text-md
              rounded-xl cursor-pointer transition-colors duration-300
              hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

LoadRequest.propTypes = {
  user: PropTypes.shape({
    full_name: PropTypes.string,
    avatar_url: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  user: state.profile.profile,
});

export default connect(mapStateToProps)(LoadRequest);