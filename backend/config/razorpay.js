const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Ensure env is loaded
if (!process.env.RAZORPAY_KEY_ID) {
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
}

let currentKeyId = (process.env.RAZORPAY_KEY_ID || '').trim();
let currentKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
let razorpayInstance = null;

const createInstance = (keyId, keySecret) => {
  if (!keyId || !keySecret) return null;
  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.warn('Razorpay instance initialization warning:', err.message);
    return null;
  }
};

// Initialize instance on module load
razorpayInstance = createInstance(currentKeyId, currentKeySecret);

const getRazorpayInstance = () => razorpayInstance;
const getRazorpayKeyId = () => currentKeyId;
const getRazorpayKeySecret = () => currentKeySecret;

const isConfiguredWithRealKeys = () => {
  return (
    Boolean(currentKeyId) &&
    Boolean(currentKeySecret) &&
    (currentKeyId.startsWith('rzp_test_') || currentKeyId.startsWith('rzp_live_')) &&
    !currentKeyId.toLowerCase().includes('mock') &&
    !currentKeySecret.toLowerCase().includes('mock')
  );
};

const updateRazorpayKeys = async (keyId, keySecret) => {
  const cleanKeyId = (keyId || '').trim();
  const cleanKeySecret = (keySecret || '').trim();

  if (!cleanKeyId || !cleanKeySecret) {
    throw new Error('Both Razorpay Key ID and Key Secret are required.');
  }

  if (!cleanKeyId.startsWith('rzp_test_') && !cleanKeyId.startsWith('rzp_live_')) {
    throw new Error('Invalid Key ID format. Razorpay Key ID must start with "rzp_test_" or "rzp_live_".');
  }

  // Test initialization with Razorpay API
  const testInstance = new Razorpay({
    key_id: cleanKeyId,
    key_secret: cleanKeySecret,
  });

  try {
    // Attempt small test order creation to verify credentials with Razorpay servers
    await testInstance.orders.create({
      amount: 100, // 100 paise = ₹1
      currency: 'INR',
      receipt: `test_${Date.now().toString().slice(-8)}`,
    });
  } catch (err) {
    if (err.statusCode === 401 || (err.error && err.error.code === 'BAD_REQUEST_ERROR')) {
      const desc = err.error?.description || err.message || 'Authentication failed';
      throw new Error(`Razorpay Authentication Failed: ${desc}. Please check your Key ID and Secret.`);
    }
    // If it's a transient connection issue but key format is valid, log warning and allow
    console.warn('Razorpay connectivity check warning:', err.message);
  }

  // Update in-memory state
  currentKeyId = cleanKeyId;
  currentKeySecret = cleanKeySecret;
  razorpayInstance = testInstance;

  // Persist to backend/.env
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (envContent.includes('RAZORPAY_KEY_ID=')) {
      envContent = envContent.replace(/RAZORPAY_KEY_ID=.*/g, `RAZORPAY_KEY_ID=${cleanKeyId}`);
    } else {
      envContent += `\nRAZORPAY_KEY_ID=${cleanKeyId}`;
    }

    if (envContent.includes('RAZORPAY_KEY_SECRET=')) {
      envContent = envContent.replace(/RAZORPAY_KEY_SECRET=.*/g, `RAZORPAY_KEY_SECRET=${cleanKeySecret}`);
    } else {
      envContent += `\nRAZORPAY_KEY_SECRET=${cleanKeySecret}`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  } catch (fileErr) {
    console.warn('Could not persist updated Razorpay keys to .env:', fileErr.message);
  }

  return { success: true, keyId: cleanKeyId };
};

module.exports = {
  get razorpay() {
    return razorpayInstance;
  },
  get razorpayKeyId() {
    return currentKeyId;
  },
  get razorpayKeySecret() {
    return currentKeySecret;
  },
  getRazorpayInstance,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  isConfiguredWithRealKeys,
  updateRazorpayKeys,
};
