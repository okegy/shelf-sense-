import { ProductModel } from '../models/Product';
import { UserModel } from '../models/User';
import { IoTSensorModel } from '../models/IoTSensor';
import { AlertModel } from '../models/Alert';
import { CategoryModel } from '../models/Category';
import { SupplierModel } from '../models/Supplier';
import mongoose from 'mongoose';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed products (MongoDB model)
    await ProductModel.initializeSampleData();
    console.log('✅ Products seeded');

    // Seed additional synthetic data
    await seedAdditionalProducts();
    console.log('✅ Additional products seeded');

    // Seed categories
    await CategoryModel.initializeSampleData();
    console.log('✅ Categories seeded');

    // Seed suppliers
    await SupplierModel.initializeSampleData();
    console.log('✅ Suppliers seeded');

    // Users are already initialized in UserModel
    console.log('✅ Users already available');

    // IoT sensors are already initialized in IoTSensorModel
    console.log('✅ IoT Sensors already available');

    // Generate initial alerts
    await AlertModel.generateExpiryAlerts();
    await AlertModel.generateStockAlerts();
    await AlertModel.generateSensorAlerts();
    console.log('✅ Initial alerts generated');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Generate additional synthetic products for better testing
export const seedAdditionalProducts = async () => {
  try {
    // Check if we already have enough products by getting all products
    const existingProducts = await ProductModel.findAll();
    if (existingProducts.length > 50) {
      console.log('✅ Additional products already exist');
      return;
    }

    const categories = [
      'fresh-produce', 'dairy', 'bakery', 'meat', 'frozen', 'beverages',
      'packaged-foods', 'snacks', 'condiments', 'cleaning', 'personal-care'
    ];

    const freshnessLevels = ['Excellent', 'Good', 'Fair', 'Poor'];
    const statuses = ['safe', 'warning', 'danger'];

    const additionalProducts = [
      // Fresh Produce
      { name: 'Red Bell Peppers', barcode: 'RBP-100', price: 85, category: 'fresh-produce', humidity: '70%', ethylene: 'High' },
      { name: 'Green Lettuce', barcode: 'GLT-101', price: 45, category: 'fresh-produce', humidity: '75%', ethylene: 'Low' },
      { name: 'Carrots', barcode: 'CRT-102', price: 30, category: 'fresh-produce', humidity: '60%', ethylene: 'Low' },
      { name: 'Broccoli', barcode: 'BRC-103', price: 65, category: 'fresh-produce', humidity: '70%', ethylene: 'Medium' },
      { name: 'Cucumbers', barcode: 'CCM-104', price: 35, category: 'fresh-produce', humidity: '65%', ethylene: 'Low' },

      // Dairy Products
      { name: 'Greek Yogurt 400g', barcode: 'GYK-006', price: 75, category: 'dairy', temperature: '4°C' },
      { name: 'Cheese Slices', barcode: 'CHS-007', price: 120, category: 'dairy', temperature: '4°C' },
      { name: 'Butter 500g', barcode: 'BTR-008', price: 95, category: 'dairy', temperature: '4°C' },
      { name: 'Fresh Cream', barcode: 'CRM-009', price: 60, category: 'dairy', temperature: '4°C' },

      // Bakery Items
      { name: 'Whole Wheat Bread', barcode: 'WWB-010', price: 40, category: 'bakery' },
      { name: 'Croissants', barcode: 'CRS-011', price: 25, category: 'bakery' },
      { name: 'Chocolate Muffins', barcode: 'CMF-012', price: 35, category: 'bakery' },
      { name: 'Bagels', barcode: 'BGL-013', price: 30, category: 'bakery' },

      // Meat Products
      { name: 'Chicken Breast', barcode: 'CKB-014', price: 180, category: 'meat', temperature: '-2°C' },
      { name: 'Ground Beef', barcode: 'GBF-015', price: 220, category: 'meat', temperature: '-2°C' },
      { name: 'Pork Chops', barcode: 'PCH-016', price: 160, category: 'meat', temperature: '-2°C' },
      { name: 'Fish Fillets', barcode: 'FSH-017', price: 200, category: 'meat', temperature: '-2°C' },

      // Frozen Foods
      { name: 'Frozen Pizza', barcode: 'FZP-018', price: 120, category: 'frozen', temperature: '-18°C' },
      { name: 'Ice Cream 1L', barcode: 'ICM-019', price: 80, category: 'frozen', temperature: '-18°C' },
      { name: 'Frozen Vegetables', barcode: 'FZV-020', price: 45, category: 'frozen', temperature: '-18°C' },

      // Beverages
      { name: 'Orange Juice 1L', barcode: 'ORJ-021', price: 55, category: 'beverages' },
      { name: 'Mineral Water 1L', barcode: 'MWT-022', price: 20, category: 'beverages' },
      { name: 'Energy Drinks', barcode: 'END-023', price: 45, category: 'beverages' },
      { name: 'Coffee Beans 500g', barcode: 'CFB-024', price: 150, category: 'beverages' },

      // Packaged Foods
      { name: 'Instant Noodles', barcode: 'INN-025', price: 12, category: 'packaged-foods' },
      { name: 'Canned Tomatoes', barcode: 'CNT-026', price: 35, category: 'packaged-foods' },
      { name: 'Pasta 500g', barcode: 'PST-027', price: 40, category: 'packaged-foods' },
      { name: 'Rice 1kg', barcode: 'RCE-028', price: 65, category: 'packaged-foods' },

      // Snacks
      { name: 'Potato Chips', barcode: 'PCH-029', price: 25, category: 'snacks' },
      { name: 'Chocolate Bars', barcode: 'CHB-030', price: 30, category: 'snacks' },
      { name: 'Cookies', barcode: 'CKS-031', price: 35, category: 'snacks' },
      { name: 'Popcorn', barcode: 'PCN-032', price: 20, category: 'snacks' },

      // Condiments
      { name: 'Ketchup 500g', barcode: 'KTC-033', price: 45, category: 'condiments' },
      { name: 'Mayonnaise', barcode: 'MAY-034', price: 55, category: 'condiments' },
      { name: 'Mustard', barcode: 'MST-035', price: 40, category: 'condiments' },
      { name: 'Soy Sauce', barcode: 'SYS-036', price: 35, category: 'condiments' },

      // Cleaning Products
      { name: 'Dish Soap', barcode: 'DSP-037', price: 25, category: 'cleaning' },
      { name: 'Laundry Detergent', barcode: 'LDT-038', price: 85, category: 'cleaning' },
      { name: 'Toilet Cleaner', barcode: 'TCL-039', price: 30, category: 'cleaning' },

      // Personal Care
      { name: 'Shampoo', barcode: 'SHP-040', price: 45, category: 'personal-care' },
      { name: 'Toothpaste', barcode: 'TTP-041', price: 35, category: 'personal-care' },
      { name: 'Body Wash', barcode: 'BDW-042', price: 50, category: 'personal-care' },
      { name: 'Deodorant', barcode: 'DOD-043', price: 40, category: 'personal-care' }
    ];

    // Generate random data for each product
    const productsToInsert = additionalProducts.map(product => {
      const count = Math.floor(Math.random() * 200) + 10; // 10-210 items
      const daysToExpiry = Math.floor(Math.random() * 30) + 1; // 1-30 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

      const freshness = freshnessLevels[Math.floor(Math.random() * freshnessLevels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        ...product,
        count,
        expiry: expiryDate.toISOString().split('T')[0],
        freshness,
        status
      };
    });

    // Insert products in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      for (const product of batch) {
        await ProductModel.create(product);
      }
      console.log(`✅ Inserted products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsToInsert.length / batchSize)}`);
    }

    console.log(`✅ Generated ${productsToInsert.length} additional synthetic products`);
  } catch (error) {
    console.error('❌ Error seeding additional products:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing database...');

    // Note: MongoDB collections will be cleared when the application restarts
    // In a production environment, you would implement proper cleanup methods

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};
