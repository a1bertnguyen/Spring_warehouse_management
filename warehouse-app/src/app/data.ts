export let MOCK_USERS = [
  {
    id: 1,
    role: 'Admin',
    email: 'admin@example.com',
    createdOn: '2023-11-01'
  },
  {
    id: 2,
    role: 'User',
    email: 'user1@example.com',
    createdOn: '2024-01-21'
  },
  {
    id: 3,
    role: 'Moderator',
    email: 'moderator@example.com',
    createdOn: '2024-05-14'
  }
];

export let CATEGORY = [
  { id: '1', name: 'cloth' },
  { id: '2', name: 'candy' },
  { id: '3', name: 'snack' },
  { id: '4', name: 'medicine' },
  { id: '5', name: 'beverage' },
  { id: '6', name: 'electronics' },
  { id: '7', name: 'cleaning' },
  { id: '8', name: 'office' }
];

export let SUPPLLIER = [
  {
    id: 1,
    name: 'Food company',
    contact: 'Alex Thomes'
  },
  {
    id: 2,
    name: 'Clothes company',
    contact: 'Heley Mathini'
  },
  {
    id: 3,
    name: 'Tool company',
    contact: 'John Robison'
  }
]

export let TRANSACTIONS = [
  {
    transaction_id: "TX001",
    transaction_type: "Buying",
    status: "Completed",
    total_products: 150,
    total_price: 5200.50,
    note: "Purchased raw materials from supplier A",
    name: "Buying Order #1",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX002",
    transaction_type: "Selling",
    status: "Completed",
    total_products: 90,
    total_price: 3700.00,
    note: "Sold to customer group B",
    name: "Selling Invoice #12",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX003",
    transaction_type: "Supplying",
    status: "Pending",
    total_products: 60,
    total_price: 2400.00,
    note: "Preparing shipment for partner C",
    name: "Supply Batch #3",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX004",
    transaction_type: "Buying",
    status: "In Progress",
    total_products: 120,
    total_price: 4800.25,
    note: "Awaiting quality inspection",
    name: "Buying Order #2",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX005",
    transaction_type: "Selling",
    status: "Completed",
    total_products: 70,
    total_price: 3100.75,
    note: "Sold products to distributor D",
    name: "Selling Invoice #13",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX006",
    transaction_type: "Supplying",
    status: "Completed",
    total_products: 100,
    total_price: 4000.00,
    note: "Delivered supplies to branch warehouse",
    name: "Supply Batch #4",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX007",
    transaction_type: "Buying",
    status: "Pending",
    total_products: 50,
    total_price: 2100.50,
    note: "New purchase request under approval",
    name: "Buying Order #3",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX008",
    transaction_type: "Selling",
    status: "In Progress",
    total_products: 110,
    total_price: 5000.00,
    note: "Ongoing retail sale campaign",
    name: "Selling Invoice #14",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX009",
    transaction_type: "Supplying",
    status: "Completed",
    total_products: 85,
    total_price: 3500.80,
    note: "Restocked supplies to store branch E",
    name: "Supply Batch #5",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX010",
    transaction_type: "Buying",
    status: "Completed",
    total_products: 200,
    total_price: 7500.00,
    note: "Bulk purchase from supplier F",
    name: "Buying Order #4",
    update_at: getNearDate()
  },

  // ✅ Extra 20 more items
  {
    transaction_id: "TX011",
    transaction_type: "Selling",
    status: "Completed",
    total_products: 140,
    total_price: 6100.00,
    note: "Retail sale event batch",
    name: "Selling Invoice #15",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX012",
    transaction_type: "Supplying",
    status: "Completed",
    total_products: 40,
    total_price: 1800.40,
    note: "Supplied items to local store",
    name: "Supply Batch #6",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX013",
    transaction_type: "Buying",
    status: "Completed",
    total_products: 175,
    total_price: 6900.50,
    note: "Purchase order with Supplier G",
    name: "Buying Order #5",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX014",
    transaction_type: "Selling",
    status: "Pending",
    total_products: 65,
    total_price: 2800.90,
    note: "Awaiting payment confirmation",
    name: "Selling Invoice #16",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX015",
    transaction_type: "Supplying",
    status: "In Progress",
    total_products: 95,
    total_price: 3700.00,
    note: "Delivering shipment to warehouse Z",
    name: "Supply Batch #7",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX016",
    transaction_type: "Buying",
    status: "Completed",
    total_products: 220,
    total_price: 8200.00,
    note: "High-volume inventory purchase",
    name: "Buying Order #6",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX017",
    transaction_type: "Selling",
    status: "Completed",
    total_products: 105,
    total_price: 4600.50,
    note: "Shipped items to online customer batch",
    name: "Selling Invoice #17",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX018",
    transaction_type: "Supplying",
    status: "Pending",
    total_products: 70,
    total_price: 2950.00,
    note: "Supply batch waiting approval",
    name: "Supply Batch #8",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX019",
    transaction_type: "Buying",
    status: "In Progress",
    total_products: 90,
    total_price: 3500.75,
    note: "Purchase under inspection",
    name: "Buying Order #7",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX020",
    transaction_type: "Selling",
    status: "Completed",
    total_products: 130,
    total_price: 5800.00,
    note: "Shipped to wholesale partner",
    name: "Selling Invoice #18",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX021",
    transaction_type: "Supplying",
    status: "Completed",
    total_products: 120,
    total_price: 4800.25,
    note: "Warehouse transfer operation",
    name: "Supply Batch #9",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX022",
    transaction_type: "Buying",
    status: "Pending",
    total_products: 55,
    total_price: 2000.00,
    note: "Small batch restock",
    name: "Buying Order #8",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX023",
    transaction_type: "Selling",
    status: "In Progress",
    total_products: 160,
    total_price: 6400.00,
    note: "Large online sale batch",
    name: "Selling Invoice #19",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX024",
    transaction_type: "Supplying",
    status: "Completed",
    total_products: 88,
    total_price: 3300.60,
    note: "Restocked shop branch Y",
    name: "Supply Batch #10",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX025",
    transaction_type: "Buying",
    status: "Completed",
    total_products: 145,
    total_price: 5600.40,
    note: "Mid-size restock order",
    name: "Buying Order #9",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX026",
    transaction_type: "Selling",
    status: "Pending",
    total_products: 50,
    total_price: 2300.00,
    note: "Customer pickup delayed",
    name: "Selling Invoice #20",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX027",
    transaction_type: "Supplying",
    status: "Completed",
    total_products: 140,
    total_price: 5600.00,
    note: "Transported goods to branch W",
    name: "Supply Batch #11",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX028",
    transaction_type: "Buying",
    status: "Completed",
    total_products: 180,
    total_price: 7200.00,
    note: "Quarterly purchase order",
    name: "Buying Order #10",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX029",
    transaction_type: "Selling",
    status: "Completed",
    total_products: 98,
    total_price: 4100.50,
    note: "Retail sale cycle end",
    name: "Selling Invoice #21",
    update_at: getNearDate()
  },
  {
    transaction_id: "TX030",
    transaction_type: "Supplying",
    status: "In Progress",
    total_products: 75,
    total_price: 3100.20,
    note: "Supply truck on route",
    name: "Supply Batch #12",
    update_at: getNearDate()
  }
];

function getNearDate() {
  const daysAgo = Math.floor(Math.random() * 10);          // 0 to 29 days
  const hours = Math.floor(Math.random() * 24);             // random hour
  const minutes = Math.floor(Math.random() * 60);           // random minutes
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export let PRODUCTS = [
  {
    product_id: "P001",
    name: "Coca-Cola 330ml",
    description: "Refreshing soft drink",
    sku: "CC330-001",
    price: 12.5,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-10-01"),
    image_url: "assets/products/coke.png",
    category_id: "5",
    category_name: "beverage"
  },
  {
    product_id: "P002",
    name: "Oreo Cookies 100g",
    description: "Chocolate cookies with cream filling",
    sku: "OR100-002",
    price: 8.0,
    stock_quantity: 0,
    expire_date: randomExpire(),
    created_at: new Date("2024-09-15"),
    image_url: "assets/products/oreo.png",
    category_id: "3",
    category_name: "snack"
  },
  {
    product_id: "P003",
    name: "Snickers Bar 50g",
    description: "Chocolate bar with peanuts and caramel",
    sku: "SN50-003",
    price: 5.5,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-11-10"),
    image_url: "assets/products/snickers_bar.png",
    category_id: "2",
    category_name: "candy"
  },
  {
    product_id: "P004",
    name: "Vitamin C 500mg",
    description: "Boosts immune system",
    sku: "VC500-004",
    price: 18.0,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-04-01"),
    image_url: "assets/products/vitaminc.png",
    category_id: "4",
    category_name: "medicine"
  },
  {
    product_id: "P005",
    name: "T-Shirt - Blue",
    description: "Comfortable cotton t-shirt",
    sku: "TS-BL-005",
    price: 20.0,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-05-20"),
    image_url: "assets/products/tshirt_blue.png",
    category_id: "1",
    category_name: "cloth"
  },
  {
    product_id: "P006",
    name: "Laundry Detergent 2kg",
    description: "Deep-clean formula",
    sku: "LD2KG-006",
    price: 32.0,
    stock_quantity: 0,
    expire_date: randomExpire(),
    created_at: new Date("2024-01-15"),
    image_url: "assets/products/detergent.png",
    category_id: "7",
    category_name: "cleaning"
  },
  {
    product_id: "P007",
    name: "USB-C Charger 25W",
    description: "Fast-charging adapter",
    sku: "UC25W-007",
    price: 45.0,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-10-10"),
    image_url: "assets/products/charger.png",
    category_id: "6",
    category_name: "electronics"
  },
  {
    product_id: "P008",
    name: "Notebook A5",
    description: "100-page lined notebook",
    sku: "NB-A5-008",
    price: 4.5,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-07-01"),
    image_url: "assets/products/notebook.png",
    category_id: "8",
    category_name: "office"
  },
  {
    product_id: "P009",
    name: "Sprite 500ml",
    description: "Lemon-lime soda",
    sku: "SP500-009",
    price: 10.0,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-09-10"),
    image_url: "assets/products/sprite.png",
    category_id: "5",
    category_name: "beverage"
  },
  {
    product_id: "P010",
    name: "KitKat 40g",
    description: "Crispy wafer chocolate bar",
    sku: "KK40-010",
    price: 4.0,
    stock_quantity: randomQuantity(),
    expire_date: randomExpire(),
    created_at: new Date("2024-12-05"),
    image_url: "assets/products/kitkat.png",
    category_id: "2",
    category_name: "candy"
  }
];


function randomExpire(): Date {
    const min = -5;   // days ago
    const max = 90;   // days from now
    const random = Math.floor(Math.random() * (max - min + 1)) + min;

    const date = new Date();
    date.setDate(date.getDate() + random);
    return date;
}

function randomQuantity(): number{
    const min = 0;
    const max = 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}