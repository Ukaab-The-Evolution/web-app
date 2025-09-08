import { useState, useRef, useEffect } from 'react';
import { FaCamera, FaChevronDown, FaCloudUploadAlt, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { ShieldSlash, ShieldTick } from 'iconsax-react';
import { IoClose } from "react-icons/io5";
import ProfileHeader from '../../ui/ProfileHeader';
import Toast from "../../ui/Toast";

const TruckingCompanyProfile = ({ user }) => {
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    companyName: user?.user_metadata?.company_name || '',
    contactPerson: user?.user_metadata?.contact_person || '',
    email: user?.email || '',
    phoneNumber: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
    fleetSize: user?.user_metadata?.fleet_size || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.user_metadata?.is_verified || false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar_url || null);
  const [verificationData, setVerificationData] = useState({
    ntn: '',
    registrationDocument: null
  });
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const profileImageInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Pakistani phone number format validation -> can be scaled up to international format
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateFleetSize = (fleetSize) => {
    const fleetSizeNumber = parseInt(fleetSize, 10);
    return !isNaN(fleetSizeNumber) && fleetSizeNumber >= 1 && Number.isInteger(fleetSizeNumber) && fleetSize.toString() === fleetSizeNumber.toString();
  };

  const validateNTN = (ntn) => {
    // ntn format: XXXXX-XXXXXXX-X
    const ntnRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return ntnRegex.test(ntn);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerificationInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB for profile image)
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          type: "error",
          message: "Profile photo must be less than 5MB.",
        });
        return;
      }
    
      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setToast({
          type: "error",
          message: "Only PNG and JPG files are allowed for profile photo.",
        });
        return;
      }

      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      
      setToast({
        type: "success",
        message: "Profile photo uploaded successfully!",
      });
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setToast({
      type: "success",
      message: "Profile image removed successfully!",
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setToast({
          type: "error",
          message: "File size must be less than 20MB.",
        });
        return;
      }
    
      // Check file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setToast({
          type: "error",
          message: "Only PDF, PNG, and JPG files are allowed.",
        });
        return;
      }

      setVerificationData(prev => ({
        ...prev,
        registrationDocument: file
      }));
    }
  };

  const handleVerificationSubmit = async () => {
    // Validation checks
    if (!verificationData.ntn.trim()) {
      setToast({
        type: "error",
        message: "National Tax Number NTN is required.",
      });
      return;
    }

    if (!validateNTN(verificationData.ntn)) {
      setToast({
        type: "error",
        message: "Please enter a valid NTN format (XXXXX-XXXXXXX-X).",
      });
      return;
    }

    if (!verificationData.registrationDocument) {
      setToast({
        type: "error",
        message: "Registration document is required.",
      });
      return;
    }

    try {
      setVerificationLoading(true);
      
      // make an API call here to submit verification documents
      console.log('Submitting verification:', verificationData);
            
      setShowVerificationModal(false);
      setShowSuccessModal(true);
      
      // Auto close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        setIsVerified(true);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      setToast({
        type: "error",
        message: "Failed to submit verification. Please try again.",
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyProfile = () => {
    setShowDropdown(false);
    setShowVerificationModal(true);
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationData({
      ntn: '',
      registrationDocument: null
    });
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };
  
  const handleSaveChanges = async () => {
    // Validation checks
    if (!formData.companyName.trim()) {
      setToast({
        type: "error",
        message: "Company name is required.",
      });
      return;
    }

    if (!formData.contactPerson.trim()) {
      setToast({
        type: "error",
        message: "Contact person's name is required.",
      });
      return;
    }

    if (!formData.email.trim()) {
      setToast({
        type: "error",
        message: "Email is required.",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      setToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setToast({
        type: "error",
        message: "Phone number is required.",
      });
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setToast({
        type: "error",
        message: "Please enter a valid phone number (e.g., 0300 1234567).",
      });
      return;
    }

    if (!formData.address.trim()) {
      setToast({
        type: "error",
        message: "Address is required.",
      });
      return;
    }

    if (!formData.fleetSize.trim()) {
      setToast({
        type: "error",
        message: "Fleet size is required.",
      });
      return;
    }

    if (!validateFleetSize(formData.fleetSize)) {
      setToast({
        type: "error",
        message: "Please enter a valid fleet size (in whole number).",
      });
      return;
    }

    try {
      setLoading(true);
      // API call here to update the user profile
      console.log('Saving profile changes:', formData);
      
      setIsEditing(false);
      // save logic here

      setToast({
        type: "success",
        message: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({
        type: "error",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
    console.log('Searching for:', query);
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
        userName={user?.first_name || "Ahmed"}
        subtitle="Your profile, your control - edit and save with ease."
        onSearch={handleSearch}
        searchPlaceholder="Search your query"
        userAvatar={user?.avatar_url}
      />

      {/* Verification Status Badge */}
      <div className='flex space-x-4 pt-3 justify-end'>
        <div className="w-1/8 pr-10">
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => !isVerified && setShowDropdown(!showDropdown)}
              className={`flex items-center space-x-2 px-2 py-1 rounded-full border transition-colors ${
                isVerified 
                ? 'bg-[#CBFFCE] text-[#0FA018] border-green-100 pr-3 pl-3' 
                : 'bg-[#FFCFC9] text-[#B6100F] border-red-200 hover:bg-red-100 cursor-pointer'
              }`}
            >
              {isVerified ? (
                <ShieldTick size="17" color="#0FA018" />
              ) : (
                <ShieldSlash size="16" color="#B6100F" />
              )}
    
              <span className="text-[14px] font-poppins font-semibold">{isVerified ? 'Verified' : 'Unverified'} </span>
              {!isVerified && <FaChevronDown className={`w-3 h-3 text-[#171717] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />}
            </div>
              
            {/* Dropdown */}
            {showDropdown && !isVerified && (
              <div className="absolute right-0 top-full mt-2 w-44 border border-gray-200 rounded-lg shadow-md z-10">
                <button
                  onClick={handleVerifyProfile}
                  className="w-full px-1 py-3 text-center text-sm text-[#3B6255] bg-[#B2D7CA3B] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Verify Your Company
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={closeVerificationModal}
              className="absolute top-4 right-4 text-[#171717] hover:text-gray-600"
            >
              <IoClose className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-[#3B6255] mb-8">Company Verification</h2>
            <p className="text-[#171717] font-regular mb-4">Enter the following details:</p>
            
            {/* NTN Field */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-[#3B6255] min-w-[55px]">
                  NTN
                </label>
                <input
                  type="text"
                  name="ntn"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={verificationData.ntn}
                  onChange={handleVerificationInputChange}
                  className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-[10px] text-[#3B6255] focus:outline-none"
                />
              </div>
            </div>
            
            {/* Registration Document Upload */}
            <div className="mb-8">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-[#3B6255] min-w-[55px] max-w-[100px]">
                  Registration Document
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 items-center px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-[10px] text-[#3B6255] cursor-pointer"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                  />
                  {verificationData.registrationDocument ? (
                    <div className="flex justify-center items-center space-x-4 text-[#3B6255]">
                      <FaCloudUploadAlt className="w-8 h-7" />
                      <span className="text-xs font-regular">{verificationData.registrationDocument.name}</span>
                      <span className="text-xs text-gray-500">
                        {(verificationData.registrationDocument.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-center space-x-4 text-[#3B6255]">
                      <FaCloudUploadAlt className="w-8 h-7" />
                      <div>
                        <div className="text-xs font-regular">Pdf/png/jpg</div>
                        <div className="text-xs">size &lt;20</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={closeVerificationModal}
                disabled={verificationLoading}
                className="w-2/4 h-[45px] px-2 rounded-full bg-[#D4D4D4] text-[#171717] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] font-poppins font-medium text-[16px] hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-1"
              >
                Cancel
              </button>
              <button
                onClick={handleVerificationSubmit}
                disabled={verificationLoading}
                className="w-2/4 h-[45px] px-2 rounded-full 
                bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-medium text-[16px]
                text-white cursor-pointer transition-colors duration-300
                hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center"
              >
                {verificationLoading ? 'Submitting...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 relative">
            <button
              onClick={closeSuccessModal}
              className="absolute top-4 right-4 text-[#171717] hover:text-gray-600"
            >
              <IoClose className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-[#3B6255] mb-16">Profile Verification</h2>
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#578C7A] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-center text-[#171717] mb-16">
                Company profile verified successfully
              </h2>
            </div>
            
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full h-[45px] px-2 rounded-full 
              bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
              shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-medium text-[16px]
              text-white cursor-pointer transition-colors duration-300
              hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-0">
        <div className="bg-white rounded-xl p-8">

          {/* Company Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-[#3B6255] border-[1px] border-[#0A0A0A] rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#3B6255]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                )}
              </div>

              {/* Camera button */}
              <div 
                onClick={() => profileImageInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-[1px] border-[#0A0A0A] cursor-pointer hover:bg-gray-200">
                <FaCamera className="w-4 h-4 text-[#0A0A0A]" />
              </div>

              {/* Remove button */}
              {profileImage && (
                <div 
                  onClick={handleRemoveProfileImage}
                  className="absolute top-0 right-0 w-7 h-7 bg-red-600 rounded-full shadow-lg flex items-center justify-center border-0 border-white cursor-pointer hover:bg-red-500"
                >
                  <FaTrash className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Hidden file input for profile image */}
              <input
                type="file"
                ref={profileImageInputRef}
                onChange={handleProfileImageUpload}
                accept=".png,.jpg,.jpeg"
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='ABC Logistics'
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='Xyz'
              />
            </div>

            {/* Email and Phone Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3B6255] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder='contact@abclogistics.com'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3B6255] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder='0300 1234567'
                />
              </div>
            </div>

            {/* Company Address */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Company Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='123 Business Street, Lahore'
              />
            </div>

            {/* Fleet Size */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Fleet Size
              </label>
              <input
                type="text"
                name="fleetSize"
                value={formData.fleetSize}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='25'
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="w-2/6 h-[45px] rounded-full
                  bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]
                  font-poppins font-semibold text-white text-[18px] leading-[100%]
                  mt-[6px] cursor-pointer transition-colors duration-300
                  hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    className="w-3/4 h-[45px] px-2 rounded-full 
                    bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                    shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px]
                    text-white mt-[6px] cursor-pointer transition-colors duration-300
                    hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-1/4 h-[45px] px-2 rounded-full bg-[#D4D4D4] text-[#171717] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] hover:bg-gray-200 mt-[6px] transition-colors duration-300 flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckingCompanyProfile;