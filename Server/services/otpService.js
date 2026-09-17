const Otp = require("../Model/Otp");

/**
 * Generate a 6-digit numeric OTP
 */
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a random password consisting strictly of uppercase and lowercase English letters
 * Requirement: "consisting only of uppercase and lowercase English letters, without any numbers or special characters"
 */
function generateLettersOnlyPassword(length = 12) {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

/**
 * Create and save OTP for a specific identifier and purpose
 */
async function createOtp(identifier, purpose, validityMinutes = 5) {
  const normalizedId = identifier.trim().toLowerCase();

  // Invalidate any existing unverified OTP for this identifier and purpose
  await Otp.deleteMany({
    identifier: normalizedId,
    purpose: purpose,
  });

  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);

  const otpRecord = await Otp.create({
    identifier: normalizedId,
    purpose: purpose,
    otp: otpCode,
    expiresAt: expiresAt,
  });

  console.log(`[OTP SERVICE] Generated OTP for ${normalizedId} [${purpose}]: ${otpCode} (Expires: ${expiresAt.toLocaleTimeString()})`);

  return {
    otp: otpCode,
    expiresAt: expiresAt,
    recordId: otpRecord._id,
  };
}

/**
 * Verify OTP
 */
async function verifyOtp(identifier, purpose, enteredOtp) {
  const normalizedId = identifier.trim().toLowerCase();

  const record = await Otp.findOne({
    identifier: normalizedId,
    purpose: purpose,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!record) {
    return {
      success: false,
      message: "No active OTP request found or OTP already used. Please request a new OTP.",
    };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    await Otp.deleteOne({ _id: record._id });
    return {
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  // Check max attempts
  if (record.attempts >= 3) {
    await Otp.deleteOne({ _id: record._id });
    return {
      success: false,
      message: "Maximum OTP attempts exceeded. Please request a new OTP.",
    };
  }

  // Check matching
  if (record.otp !== enteredOtp.toString().trim()) {
    record.attempts += 1;
    await record.save();
    return {
      success: false,
      message: `Invalid OTP. You have ${3 - record.attempts} attempt(s) remaining.`,
    };
  }

  // Mark as verified
  record.verified = true;
  await record.save();

  return {
    success: true,
    message: "OTP verified successfully.",
    record,
  };
}

module.exports = {
  createOtp,
  verifyOtp,
  generateLettersOnlyPassword,
};
