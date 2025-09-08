import { useState, useRef, useEffect } from 'react';
import { FaCamera, FaChevronDown, FaTimes, FaCloudUploadAlt, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { ShieldSlash, ShieldTick } from 'iconsax-react';
import ProfileHeader from '../../ui/ProfileHeader';
import Toast from "../../ui/Toast";

const DriverProfile = ({ user }) => {
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phoneNumber: user?.user_metadata?.phone || '',
    experienceYears: user?.user_metadata?.experience_years || '',
    currentCompany: user?.user_metadata?.current_company || '',
    emergencyContact: user?.user_metadata?.emergency_contact || '',
    emergencyContactName: user?.user_metadata?.emergency_contactName || '',
    address: user?.user_metadata?.address || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.user_metadata?.is_verified || false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar_url || null);
  const [verificationData, setVerificationData] = useState({
    cnic: '',
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

  const validateYears = (years) => {
    const experience = parseInt(years, 10);
    return !isNaN(experience) && experience >= 1 && Number.isInteger(experience) && years.toString() === experience.toString();
  };

  const validateCNIC = (cnic) => {
    // CNIC format: XXXXX-XXXXXXX-X
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return cnicRegex.test(cnic);
  };

  const validateLicense = (license) => {
    // license format: XXXXX-XXXXXXX-X
    const licenseRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return licenseRegex.test(license);
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
    if (!verificationData.cnic.trim()) {
      setToast({
        type: "error",
        message: "CNIC is required.",
      });
      return;
    }

    if (!validateCNIC(verificationData.cnic)) {
      setToast({
        type: "error",
        message: "Please enter a valid CNIC format (XXXXX-XXXXXXX-X).",
      });
      return;
    }

    if (!verificationData.license.trim()) {
      setToast({
        type: "error",
        message: "License Number is required.",
      });
      return;
    }

    if (!validateLicense(verificationData.license)) {
      setToast({
        type: "error",
        message: "Please enter a valid License format (XXXXX-XXXXXXX-X).",
      });
      return;
    }

    if (!verificationData.registrationDocument) {
      setToast({
        type: "error",
        message: "Driver registration document is required.",
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
      cnic: '',
      registrationDocument: null
    });
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };
  
  const handleSaveChanges = async () => {
    // Validation checks
    if (!formData.fullName.trim()) {
      setToast({
        type: "error",
        message: "Full name is required.",
      });
      return;
    }

    if (!formData.emergencyContactName.trim()) {
      setToast({
        type: "error",
        message: "Emergency contact person's name is required.",
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

    if (!formData.emergencyContact.trim()) {
      setToast({
        type: "error",
        message: "Emergency contact number is required.",
      });
      return;
    }

    if (!validatePhoneNumber(formData.emergencyContact)) {
      setToast({
        type: "error",
        message: "Please enter a valid emergency phone number (e.g., 0300 1234567).",
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

    if (!formData.experienceYears.trim()) {
      setToast({
        type: "error",
        message: "Years of experience are required.",
      });
      return;
    }

    if (!validateYears(formData.experienceYears)) {
      setToast({
        type: "error",
        message: "Please enter valid number of years (e.g. 2).",
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
                  Verify Your Profile
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
              <FaTimes className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-[#3B6255] mb-8">Profile Verification</h2>
            <p className="text-[#171717] font-regular mb-6">Enter the following details</p>
            
            {/* CNIC Field */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-[#3B6255] min-w-[100px]">
                  CNIC
                </label>
                <input
                  type="text"
                  name="cnic"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={verificationData.cnic}
                  onChange={handleVerificationInputChange}
                  className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-[10px] text-[#3B6255] focus:outline-none"
                />
              </div>
            </div>

            {/* License Field */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-[#3B6255] min-w-[55px] max-w-[100px]">
                  License Number
                </label>
                <input
                  type="text"
                  name="license"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={verificationData.license}
                  onChange={handleVerificationInputChange}
                  className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-[10px] text-[#3B6255] focus:outline-none"
                />
              </div>
            </div>
            
            {/* Driver Registration Document Upload */}
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
              <FaTimes className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-[#3B6255] mb-16">Profile Verification</h2>
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#578C7A] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-center text-[#171717] mb-16">
                Driver profile verified successfully
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

          {/* Profile Picture Section */}
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
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='Abc'
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
                  placeholder='example@gmail.com'
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

            {/* Emergency Contact and Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3B6255] mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder='Xyz'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3B6255] mb-2">
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder='0333 9876543'
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='123 A, North Street, Lahore'
              />
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium text-[#3B6255] mb-2">
                Experience Years
              </label>
              <input
                type="text"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder='8'
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

export default DriverProfile;