// Performance Issue: Heavy synchronous computations

export const analyzeUserBehavior = (product, user, preferences) => {
  // Performance Issue: Nested loops and complex calculations
  const analysis = {
    relevanceScore: 0,
    personalizedPrice: product.price,
    recommendations: [],
  };
  
  // Performance Issue: Synchronous heavy computation
  for (let i = 0; i < 1000; i++) {
    const factor = Math.random();
    analysis.relevanceScore += factor * (user?.id || 1) * (product.id % 10);
  }
  
  // Performance Issue: String operations in loop
  const keywords = product.name.toLowerCase().split(' ');
  const description = product.description.toLowerCase();
  
  keywords.forEach(keyword => {
    let count = 0;
    for (let i = 0; i < description.length - keyword.length; i++) {
      if (description.substring(i, i + keyword.length) === keyword) {
        count++;
      }
    }
    analysis.relevanceScore += count * 10;
  });
  
  // Performance Issue: Creating large arrays
  analysis.recommendations = Array.from({ length: 100 }, (_, i) => ({
    productId: (product.id + i) % 500,
    score: Math.random() * analysis.relevanceScore,
    reason: `Similar to ${product.name}`,
  }));
  
  return analysis;
};

export const calculateMetrics = (product, cartItems, analyticsData) => {
  let score = 0;
  
  // Performance Issue: Iterating through potentially large arrays
  analyticsData.forEach(event => {
    if (event.data?.productId === product.id) {
      score += 10;
    }
    
    // Performance Issue: JSON operations
    const eventString = JSON.stringify(event);
    if (eventString.includes(product.name)) {
      score += 5;
    }
  });
  
  // Performance Issue: Nested array operations
  cartItems.forEach(item => {
    if (item.category === product.category) {
      score += 20;
      
      // Performance Issue: Finding common tags
      const commonTags = item.tags.filter(tag => 
        product.tags.some(pTag => 
          pTag.toLowerCase() === tag.toLowerCase()
        )
      );
      
      score += commonTags.length * 15;
    }
  });
  
  // Performance Issue: Complex math operations
  const priceScore = Math.log(product.price) * Math.sqrt(product.reviews.length);
  const ratingScore = product.reviews.reduce((sum, r) => sum + Math.pow(r.rating, 2), 0);
  
  return score + priceScore + ratingScore;
};