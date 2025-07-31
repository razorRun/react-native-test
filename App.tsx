import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Animated,
  DeviceEventEmitter,
  InteractionManager,
} from 'react-native';
import ProductList from './src/components/ProductList';
import SearchBar from './src/components/SearchBar';
import CartProvider, { useCart } from './src/contexts/CartContext';
import ThemeProvider, { useTheme } from './src/contexts/ThemeContext';
import UserProvider, { useUser } from './src/contexts/UserContext';
import AnalyticsProvider from './src/contexts/AnalyticsContext';
import { fetchProducts, fetchCategories, fetchUserData, fetchRecommendations } from './src/services/api';
import { analyzeUserBehavior, calculateMetrics } from './src/utils/analytics';

const AppContent = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [metrics, setMetrics] = useState({});
  
  // Performance Issue: Multiple context subscriptions causing re-renders
  const { cartItems, updateCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, preferences } = useUser();
  
  // Performance Issue: Heavy refs that persist across renders
  const analyticsData = useRef([]);
  const renderCount = useRef(0);
  const animationValues = useRef(
    Array.from({ length: 100 }, () => new Animated.Value(0))
  ).current;
  
  // Performance Issue: Event listeners without cleanup
  useEffect(() => {
    DeviceEventEmitter.addListener('productUpdate', handleProductUpdate);
    DeviceEventEmitter.addListener('cartSync', handleCartSync);
    DeviceEventEmitter.addListener('analyticsEvent', handleAnalyticsEvent);
  }, []);
  
  // Performance Issue: Expensive initialization on every mount
  useEffect(() => {
    renderCount.current += 1;
    console.log(`App rendered ${renderCount.current} times`);
    
    // Performance Issue: Not using InteractionManager for heavy work
    loadInitialData();
    startBackgroundSync();
    initializeAnimations();
  }, []);
  
  // Performance Issue: Recursive setTimeout creating memory leaks
  const startBackgroundSync = () => {
    const sync = () => {
      fetchUserData().then(data => {
        analyticsData.current.push({
          timestamp: Date.now(),
          data: JSON.parse(JSON.stringify(data)), // Deep clone
        });
      });
      setTimeout(sync, 1000); // Runs every second!
    };
    sync();
  };
  
  // Performance Issue: Initializing 100 animations
  const initializeAnimations = () => {
    animationValues.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 + index * 10,
            useNativeDriver: false, // Performance Issue: Not using native driver
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000 + index * 10,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };
  
  const loadInitialData = async () => {
    // Performance Issue: Sequential loading with unnecessary delays
    setLoading(true);
    
    const startTime = Date.now();
    const productsData = await fetchProducts();
    
    // Performance Issue: Synchronous heavy computation blocking UI
    const enrichedProducts = productsData.map(product => {
      const analytics = analyzeUserBehavior(product, user, preferences);
      const score = calculateMetrics(product, cartItems, analyticsData.current);
      return {
        ...product,
        analytics,
        score,
        // Performance Issue: Creating new Date objects for each product
        lastUpdated: new Date(),
        formattedPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(product.price),
      };
    });
    
    setProducts(enrichedProducts);
    setFilteredProducts(enrichedProducts);
    
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
    
    // Performance Issue: Fetching recommendations for all products
    const allRecommendations = await Promise.all(
      enrichedProducts.map(p => fetchRecommendations(p.id))
    );
    setRecommendations(allRecommendations.flat());
    
    const loadTime = Date.now() - startTime;
    console.log(`Data loaded in ${loadTime}ms`);
    
    setLoading(false);
  };
  
  // Performance Issue: Complex filtering without optimization
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = searchTerm
        ? Object.values(product).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true;
      
      const matchesCategory = selectedCategory === 'all' || 
        product.category === selectedCategory;
      
      // Performance Issue: Recalculating recommendations on every filter
      const hasRecommendation = recommendations.some(rec => 
        rec.relatedProducts.includes(product.id)
      );
      
      return matchesSearch && matchesCategory && hasRecommendation;
    });
    
    // Performance Issue: Sorting without memoization
    const sorted = filtered.sort((a, b) => {
      const scoreA = calculateMetrics(a, cartItems, analyticsData.current);
      const scoreB = calculateMetrics(b, cartItems, analyticsData.current);
      return scoreB - scoreA;
    });
    
    setFilteredProducts(sorted);
    
    // Performance Issue: Updating metrics on every filter change
    updateMetrics(sorted);
  }, [searchTerm, selectedCategory, products, cartItems, recommendations]);
  
  const updateMetrics = (products) => {
    const newMetrics = {
      totalProducts: products.length,
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      categories: [...new Set(products.map(p => p.category))],
      priceRange: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
      },
      // Performance Issue: Complex nested calculations
      categoryStats: categories.map(cat => ({
        name: cat,
        count: products.filter(p => p.category === cat).length,
        avgPrice: products
          .filter(p => p.category === cat)
          .reduce((sum, p) => sum + p.price, 0) / 
          products.filter(p => p.category === cat).length,
      })),
    };
    setMetrics(newMetrics);
  };
  
  // Event handlers creating closures over large data
  const handleProductUpdate = (event) => {
    setProducts(prev => prev.map(p => 
      p.id === event.productId 
        ? { ...p, ...event.updates, lastModified: new Date() }
        : p
    ));
  };
  
  const handleCartSync = () => {
    // Performance Issue: Triggering full re-render for cart sync
    setProducts([...products]);
  };
  
  const handleAnalyticsEvent = (event) => {
    analyticsData.current.push(event);
    // Performance Issue: State update on every analytics event
    setMetrics(prev => ({ ...prev, lastEvent: Date.now() }));
  };
  
  const handleSearch = (text) => {
    setSearchTerm(text);
    // Performance Issue: Triggering analytics on every keystroke
    DeviceEventEmitter.emit('analyticsEvent', {
      type: 'search',
      query: text,
      timestamp: Date.now(),
    });
  };
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Performance Issue: Unnecessary product refetch on category change
    loadInitialData();
  };
  
  const handleProductPress = (product) => {
    // Performance Issue: Complex calculations in event handler
    const related = products.filter(p => {
      const sharedTags = p.tags.filter(tag => product.tags.includes(tag));
      const priceRange = Math.abs(p.price - product.price) < 50;
      const sameCategory = p.category === product.category;
      return sharedTags.length > 0 && priceRange && sameCategory && p.id !== product.id;
    });
    
    console.log('Related products:', related);
    updateCart(product);
    
    // Performance Issue: Triggering multiple state updates
    DeviceEventEmitter.emit('analyticsEvent', {
      type: 'productView',
      productId: product.id,
      relatedCount: related.length,
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading {products.length} products...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        // Performance Issue: Capturing all scroll events
        onScroll={({ nativeEvent }) => {
          DeviceEventEmitter.emit('analyticsEvent', {
            type: 'scroll',
            offset: nativeEvent.contentOffset.y,
          });
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Product Catalog ({metrics.totalProducts} items)
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Welcome, {user?.name || 'Guest'} | Cart: {cartItems.length}
          </Text>
        </View>
        
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search products..."
          value={searchTerm}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          <View style={styles.categoryWrapper}>
            {['all', ...categories].map((category, index) => (
              <Animated.View
                key={category}
                style={{
                  opacity: animationValues[index] || 1,
                  transform: [{
                    scale: animationValues[index]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }) || 1,
                  }],
                }}
              >
                <Text
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.selectedCategory,
                    { color: theme.text }
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  {category} ({metrics.categoryStats?.find(s => s.name === category)?.count || 0})
                </Text>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
        
        <ProductList 
          products={filteredProducts}
          onProductPress={handleProductPress}
          animationValues={animationValues}
        />
        
        <View style={styles.metricsContainer}>
          <Text style={[styles.metricsText, { color: theme.textSecondary }]}>
            Avg Price: ${metrics.averagePrice?.toFixed(2)} | 
            Range: ${metrics.priceRange?.min} - ${metrics.priceRange?.max}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <AnalyticsProvider>
      <UserProvider>
        <ThemeProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ThemeProvider>
      </UserProvider>
    </AnalyticsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  categoryContainer: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  categoryWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#007bff',
  },
  metricsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  metricsText: {
    fontSize: 12,
  },
});

export default App;