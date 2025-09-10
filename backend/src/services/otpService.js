// import crypto from 'crypto';

// // In-memory store for OTPs (for development)
// // In production, use Redis or similar
// const otpStore = new Map();

// // Clean up expired OTPs every hour
// setInterval(() => {
//   const now = Date.now();
//   for (const [key, value] of otpStore.entries()) {
//     if (value.expiresAt < now) {
//       otpStore.delete(key);
//     }
//   }
// }, 60 * 60 * 1000);

// export class OTPService {
//   static generateOTP(userId, purpose = 'registration', expiresInMinutes = 15) {
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    
//     // Hash the OTP for storage
//     const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
//     const storeKey = `${userId}:${purpose}`;
    
//     otpStore.set(storeKey, {
//       hashedOTP,
//       expiresAt,
//       attempts: 0,
//       purpose
//     });
    
//     return otp;
//   }

//   static verifyOTP(userId, otp, purpose = 'registration', maxAttempts = 3) {
//     const storeKey = `${userId}:${purpose}`;
//     const stored = otpStore.get(storeKey);
    
//     if (!stored) return { valid: false, reason: 'OTP_NOT_FOUND' };
//     if (stored.expiresAt < Date.now()) {
//       otpStore.delete(storeKey);
//       return { valid: false, reason: 'OTP_EXPIRED' };
//     }
//     if (stored.attempts >= maxAttempts) {
//       otpStore.delete(storeKey);
//       return { valid: false, reason: 'TOO_MANY_ATTEMPTS' };
//     }
    
//     // Increment attempt counter
//     stored.attempts++;
    
//     const hashedInput = crypto.createHash('sha256').update(otp).digest('hex');
//     const isValid = hashedInput === stored.hashedOTP;
    
//     if (isValid) {
//       // Remove OTP on successful verification
//       otpStore.delete(storeKey);
//       return { valid: true };
//     }
    
//     // Update attempts count
//     otpStore.set(storeKey, stored);
    
//     return { 
//       valid: false, 
//       reason: 'INVALID_OTP',
//       remainingAttempts: maxAttempts - stored.attempts
//     };
//   }

//   static resendOTP(userId, purpose = 'registration') {
//     const storeKey = `${userId}:${purpose}`;
    
//     // Remove existing OTP if any
//     if (otpStore.has(storeKey)) {
//       otpStore.delete(storeKey);
//     }
    
//     return this.generateOTP(userId, purpose);
//   }

//   static cleanupUserOTPs(userId) {
//     for (const key of otpStore.keys()) {
//       if (key.startsWith(`${userId}:`)) {
//         otpStore.delete(key);
//       }
//     }
//   }
// }