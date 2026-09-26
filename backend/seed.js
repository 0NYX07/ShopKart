require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

const seedProducts = [
  {
    name: 'AeroPulse Wireless Noise-Cancelling Headphones',
    description: 'Immersive sound with 40-hour battery life, active hybrid noise cancellation, and plush memory foam ear cushions for all-day comfort.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    name: 'Chronos Minimalist Chronograph Watch',
    description: 'Precision Japanese quartz movement encased in aerospace-grade brushed steel with a genuine Italian leather strap.',
    price: 3499,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    stock: 14
  },
  {
    name: 'GlideRunner Pro Breathable Sneakers',
    description: 'Ultra-lightweight mesh upper with responsive kinetic rebound foam soles designed for sprint performance and urban walking.',
    price: 2899,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    stock: 19
  },
  {
    name: 'Artisan Ceramic Pour-Over Kettle & Brewer Set',
    description: 'Handcrafted matte ceramic dripper coupled with a precision gooseneck kettle for the supreme specialty coffee brew ritual.',
    price: 1999,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    stock: 8
  },
  {
    name: 'The Design of Everyday Things — Hardcover Edition',
    description: 'The definitive classic on human-centered cognitive design principles by Don Norman. Essential reading for thinkers and builders.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    stock: 30
  },
  {
    name: 'Lumix Neo Mechanical Keyboard (RGB Backlit)',
    description: 'Hot-swappable mechanical switches with custom PBT keycaps, sound-dampening silicone gasket, and dynamic RGB backlighting.',
    price: 5299,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 12
  },
  {
    name: 'Nordic Heritage Merino Wool Sweater',
    description: 'Spun from 100% sustainably sourced virgin merino wool offering exceptional thermal regulation, softness, and timeless aesthetic.',
    price: 3799,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    stock: 7
  },
  {
    name: 'TerraTrack All-Weather Trail Hiking Boots',
    description: 'Waterproof Gore-Tex lining with rugged Vibram lugged outsoles engineered for high-altitude rocky scrambles and muddy descents.',
    price: 6499,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    stock: 10
  },
  {
    name: 'AromaZen Ultrasonic Ceramic Diffuser',
    description: 'Whisper-quiet cold ultrasonic mist diffusion with ambient warm LED glow and auto shut-off for pure wellness aromatherapy.',
    price: 1599,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    stock: 0
  }
];

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Check if products exist
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products. Updating/ensuring fresh seed...`);
      await Product.deleteMany({});
    }

    await Product.insertMany(seedProducts);
    console.log(`Successfully seeded ${seedProducts.length} demo products!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

runSeed();
