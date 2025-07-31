// Performance Issue: No request debouncing or caching

let requestCount = 0;

// Performance Issue: Creating large mock datasets
const generateMockData = (count) => {
  const categories = ['electronics', 'clothing', 'home', 'sports', 'books'];
  const tags = ['new', 'sale', 'popular', 'trending', 'limited'];
  
  const products = [];
  for (let i = 1; i <= count; i++) {
    // Performance Issue: Complex object creation in loop
    products.push({
      id: i,
      name: `Product ${i} - ${categories[i % categories.length]}`,
      description: `This is a detailed description for product ${i}. It contains information about features and benefits.`,
      price: Math.floor(Math.random() * 900) + 100,
      originalPrice: Math.floor(Math.random() * 1000) + 200,
      category: categories[i % categories.length],
      image: `https://picsum.photos/200/200?random=${i}`,
      rating: Math.random() * 5,
      // Performance Issue: Creating large review arrays
      reviews: Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, j) => ({
        id: j,
        userId: Math.floor(Math.random() * 100),
        rating: Math.random() * 5,
        comment: `Review ${j} for product ${i}.`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      })),
      tags: tags.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1),
      priceHistory: [],
    });
  }
  
  return products;
};

export const fetchProducts = async () => {
  requestCount++;
  console.log(`API call #${requestCount}: fetchProducts`);
  
  // Performance Issue: No caching, always generating new data
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Performance Issue: Returning 500 products (simulator-friendly)
  return generateMockData(500);
};

export const fetchCategories = async () => {
  requestCount++;
  console.log(`API call #${requestCount}: fetchCategories`);
  
  await new Promise(resolve => setTimeout(resolve, 800));
  return ['electronics', 'clothing', 'home', 'sports', 'books'];
};

export const fetchUserData = async () => {
  requestCount++;
  console.log(`API call #${requestCount}: fetchUserData`);
  
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'light',
      notifications: true,
    },
  };
};

export const fetchRecommendations = async (productId) => {
  requestCount++;
  console.log(`API call #${requestCount}: fetchRecommendations for product ${productId}`);
  
  // Performance Issue: No batching of recommendation requests
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    productId,
    relatedProducts: Array.from({ length: 5 }, (_, i) => (productId + i + 1) % 500),
    score: Math.random(),
  };
};