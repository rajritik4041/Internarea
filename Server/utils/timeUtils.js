// Server/utils/timeUtils.js
// Provides IST (Indian Standard Time, UTC+5:30) calculations and time window validations

function getISTDate() {
  const now = new Date();
  // UTC time + 5.5 hours in milliseconds
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

/**
 * Mobile login window: Only allowed between 10:00 AM and 1:00 PM IST (10:00 to 13:00)
 */
function isMobileLoginWindowAllowed() {
  const ist = getISTDate();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 10:00 AM is 600 minutes, 1:00 PM (13:00) is 780 minutes
  const allowed = totalMinutes >= 600 && totalMinutes <= 780;
  return {
    allowed,
    currentTimeIST: formatISTTime(ist),
    requiredWindow: "10:00 AM to 1:00 PM IST",
    message: "Mobile access is only permitted between 10:00 AM and 1:00 PM IST. Please use a desktop/laptop or log in during permitted hours."
  };
}

/**
 * Subscription payment window: Only allowed between 5:00 AM and 11:45 AM IST (05:00 to 11:45)
 */
function isSubscriptionPaymentWindowAllowed() {
  const ist = getISTDate();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 5:00 AM is 300 minutes, 11:45 AM is 705 minutes
  const allowed = totalMinutes >= 300 && totalMinutes <= 705;
  return {
    allowed,
    currentTimeIST: formatISTTime(ist),
    requiredWindow: "5:00 AM to 11:45 AM IST",
    message: "Subscription payments are only permitted between 5:00 AM and 11:45 AM IST. Please initiate your payment during this window."
  };
}

function formatISTTime(date) {
  const d = date || getISTDate();
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function getISTFormattedDate(date) {
  const d = date || getISTDate();
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

module.exports = {
  getISTDate,
  isMobileLoginWindowAllowed,
  isSubscriptionPaymentWindowAllowed,
  formatISTTime,
  getISTFormattedDate,
};
