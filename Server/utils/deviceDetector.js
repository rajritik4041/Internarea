// Server/utils/deviceDetector.js
// Extracts browser, version, OS, device type, model, IP, and location from request

function detectDevice(req) {
  const ua = req.headers["user-agent"] || "";
  let browser = "Unknown";
  let browserVersion = "";
  let os = "Unknown";
  let deviceType = "desktop"; // desktop, laptop, tablet, mobile
  let deviceModel = "Standard";

  // Device Type detection
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|bb10|mini|windows\sce|palm/i.test(ua)) {
    deviceType = "mobile";
  } else if (/macintosh|mac os x/i.test(ua)) {
    deviceType = "laptop";
  } else if (/windows nt/i.test(ua)) {
    deviceType = "desktop";
  } else if (/linux/i.test(ua)) {
    deviceType = "desktop";
  }

  // Check explicit client device header if passed
  if (req.headers["x-device-type"]) {
    deviceType = req.headers["x-device-type"].toLowerCase();
  }

  // OS detection
  if (/windows nt 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/windows nt 6.2/i.test(ua)) os = "Windows 8";
  else if (/windows nt 6.1/i.test(ua)) os = "Windows 7";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Browser detection (Note: Chrome UA contains Safari, Edge UA contains Chrome)
  const isEdge = /edg\/([0-9.]+)/i.test(ua);
  const isOpera = /opr\/([0-9.]+)/i.test(ua);
  const isChrome = !isEdge && !isOpera && /chrome\/([0-9.]+)/i.test(ua);
  const isFirefox = /firefox\/([0-9.]+)/i.test(ua);
  const isSafari = !isChrome && !isEdge && !isOpera && /safari\/([0-9.]+)/i.test(ua);

  if (isEdge) {
    browser = "Microsoft Edge";
    browserVersion = ua.match(/edg\/([0-9.]+)/i)?.[1] || "";
  } else if (isOpera) {
    browser = "Opera";
    browserVersion = ua.match(/opr\/([0-9.]+)/i)?.[1] || "";
  } else if (isChrome) {
    browser = "Google Chrome";
    browserVersion = ua.match(/chrome\/([0-9.]+)/i)?.[1] || "";
  } else if (isFirefox) {
    browser = "Mozilla Firefox";
    browserVersion = ua.match(/firefox\/([0-9.]+)/i)?.[1] || "";
  } else if (isSafari) {
    browser = "Apple Safari";
    browserVersion = ua.match(/version\/([0-9.]+)/i)?.[1] || "";
  } else if (req.headers["x-client-browser"]) {
    browser = req.headers["x-client-browser"];
  }

  // Device Model hints
  if (/iphone/i.test(ua)) deviceModel = "Apple iPhone";
  else if (/ipad/i.test(ua)) deviceModel = "Apple iPad";
  else if (/pixel/i.test(ua)) deviceModel = "Google Pixel";
  else if (/samsung|sm-[a-z0-9]+/i.test(ua)) deviceModel = "Samsung Galaxy";
  else if (/redmi|mi [a-z0-9]+/i.test(ua)) deviceModel = "Xiaomi Redmi";
  else if (/macintosh/i.test(ua)) deviceModel = "Apple Mac";
  else if (/windows/i.test(ua)) deviceModel = "PC / Workstation";

  // Extract IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "127.0.0.1";

  // Location mock / approximate
  let location = "New Delhi, India";
  if (req.headers["x-client-location"]) {
    location = req.headers["x-client-location"];
  } else if (ip === "127.0.0.1" || ip === "::1") {
    location = "Localhost (Dev)";
  }

  return {
    browser,
    browserVersion,
    isGoogleChrome: browser === "Google Chrome",
    os,
    deviceType,
    isMobile: deviceType === "mobile",
    deviceModel,
    ip,
    location,
    userAgent: ua,
  };
}

module.exports = { detectDevice };
