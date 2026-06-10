require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const tags = ['loyal', 'new', 'premium', 'at-risk', 'high-value', 'seasonal'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(n) { return new Date(Date.now() - n * 86400000); }

const firstNames = ['Aarav','Priya','Rohit','Sneha','Vikram','Ananya','Arjun','Neha','Karan','Pooja',
  'Rahul','Divya','Amit','Riya','Suresh','Kavya','Raj','Meera','Dev','Nisha','Aditya','Sonal',
  'Varun','Deepa','Harsh','Shruti','Nikhil','Anjali','Kunal','Preeti'];
const lastNames = ['Sharma','Patel','Singh','Kumar','Gupta','Mehta','Joshi','Nair','Reddy','Desai',
  'Verma','Rao','Iyer','Pillai','Malhotra','Kapoor','Bose','Chatterjee','Mishra','Tiwari'];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Customer.deleteMany({});
  await Order.deleteMany({});
  console.log('Cleared existing data...');

  const customers = [];
  for (let i = 0; i < 100; i++) {
    const name = `${randItem(firstNames)} ${randItem(lastNames)}`;
    const email = `${name.toLowerCase().replace(' ', '.')}${i}@example.com`;
    const visitCount = rand(1, 40);
    const totalSpend = rand(500, 80000);
    const lastActive = daysAgo(rand(1, 180));
    customers.push({
      name, email,
      phone: `+91${rand(7000000000, 9999999999)}`,
      city: randItem(cities),
      totalSpend,
      visitCount,
      lastActiveDate: lastActive,
      tags: [randItem(tags), ...(Math.random() > 0.6 ? [randItem(tags)] : [])]
    });
  }

  const savedCustomers = await Customer.insertMany(customers);
  console.log(`Seeded ${savedCustomers.length} customers`);

  const orders = [];
  for (const customer of savedCustomers) {
    const numOrders = rand(1, 8);
    for (let j = 0; j < numOrders; j++) {
      orders.push({
        customerId: customer._id,
        customerEmail: customer.email,
        amount: rand(200, 15000),
        items: [{ name: randItem(['T-Shirt','Jeans','Shoes','Watch','Bag']), price: rand(200, 5000), qty: rand(1, 3) }],
        status: Math.random() > 0.1 ? 'completed' : 'cancelled',
        createdAt: daysAgo(rand(1, 365))
      });
    }
  }

  await Order.insertMany(orders);
  console.log(`Seeded ${orders.length} orders`);
  mongoose.disconnect();
  console.log('Done! Database seeded successfully.');
}

seed().catch(console.error);