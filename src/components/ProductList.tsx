import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  LayoutAnimation,
  UIManager,
  Platform,
  findNodeHandle,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { processImage, generateThumbnail } from '../utils/imageProcessing';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 150;

// Performance Issue: Complex component without optimization
const ProductList = ({ products, onProductPress, animationValues }) => {
  const { theme } = useTheme();
  const { cartItems, updateCart } = useCart();
  const [expandedItems, setExpandedItems] = useState({});
  const [imageCache, setImageCache] = useState({});
  const listRef = useRef(null);
  const itemRefs = useRef({});
  const measureCache = useRef({});
  
  // Performance Issue: Creating new PanResponder for each item
  const createPanResponder = (item) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Performance Issue: Complex animation on touch
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setExpandedItems(prev => ({ ...prev, [item.id]: true }));
      },
      onPanResponderMove: (evt, gestureState) => {
        // Performance Issue: State update on every move
        if (Math.abs(gestureState.dx) > 50) {
          updateCart(item);
        }
      },
      onPanResponderRelease: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedItems(prev => ({ ...prev, [item.id]: false }));
      },
    });
  };
  
  // Performance Issue: Measuring all items on mount
  useEffect(() => {
    setTimeout(() => {
      products.forEach((product, index) => {
        if (itemRefs.current[product.id]) {
          const handle = findNodeHandle(itemRefs.current[product.id]);
          if (handle) {
            UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
              measureCache.current[product.id] = { x, y, width, height, pageX, pageY };
            });
          }
        }
      });
    }, 100);
  }, [products]);
  
  // Performance Issue: Processing images for all products
  useEffect(() => {
    products.forEach(async (product) => {
      const processed = await processImage(product.image);
      const thumbnail = await generateThumbnail(processed);
      setImageCache(prev => ({
        ...prev,
        [product.id]: { processed, thumbnail }
      }));
    });
  }, [products]);
  
  const ProductItem = ({ item, index }) => {
    const panResponder = useRef(createPanResponder(item)).current;
    const animatedValue = animationValues[index] || new Animated.Value(0);
    const [localExpanded, setLocalExpanded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Performance Issue: Complex calculations on every render
    const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
    const cartQuantity = cartItems.find(cartItem => cartItem.id === item.id)?.quantity || 0;
    const discount = Math.round((item.originalPrice - item.price) / item.originalPrice * 100);
    const savings = item.originalPrice - item.price;
    
    // Performance Issue: Creating derived state without memoization
    const priceHistory = item.priceHistory || Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      price: item.price + (Math.random() - 0.5) * 20,
    }));
    
    const averageRating = item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length;
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: item.reviews.filter(r => Math.floor(r.rating) === rating).length,
    }));
    
    // Performance Issue: Inline component definition
    const RatingStars = () => {
      const stars = [];
      for (let i = 0; i < 5; i++) {
        const filled = i < Math.floor(averageRating);
        const half = i === Math.floor(averageRating) && averageRating % 1 >= 0.5;
        
        stars.push(
          <Animated.Text
            key={i}
            style={[
              styles.star,
              {
                color: filled ? '#ffd700' : '#ccc',
                transform: [{
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                }],
              },
            ]}
          >
            {filled ? '★' : half ? '⯨' : '☆'}
          </Animated.Text>
        );
      }
      return <View style={styles.starsContainer}>{stars}</View>;
    };
    
    // Performance Issue: Event handler creating closure over all data
    const handlePress = () => {
      // Performance Issue: Layout animation on every press
      LayoutAnimation.configureNext({
        duration: 300,
        create: { type: 'linear', property: 'opacity' },
        update: { type: 'spring', springDamping: 0.4 },
        delete: { type: 'linear', property: 'opacity' },
      });
      
      setLocalExpanded(!localExpanded);
      onProductPress(item);
      
      // Performance Issue: Scrolling to item with animation
      if (listRef.current && measureCache.current[item.id]) {
        listRef.current.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: true,
        });
      }
    };
    
    return (
      <Animated.View
        ref={ref => itemRefs.current[item.id] = ref}
        {...panResponder.panHandlers}
        style={[
          styles.productItem,
          {
            backgroundColor: theme.cardBackground,
            height: expandedItems[item.id] || localExpanded ? ITEM_HEIGHT * 2 : ITEM_HEIGHT,
            transform: [{
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, isInCart ? 10 : 0],
              }),
            }],
            opacity: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.8, 1],
            }),
          },
        ]}
      >
        <TouchableOpacity onPress={handlePress} style={styles.itemContent}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageCache[item.id]?.processed || item.image }}
              style={[
                styles.productImage,
                { opacity: imageLoaded ? 1 : 0.3 },
              ]}
              onLoad={() => setImageLoaded(true)}
              // Performance Issue: No image caching props
            />
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
            {isInCart && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: theme.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
              {item.originalPrice > item.price && (
                <>
                  <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                    ${item.originalPrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.savings, { color: theme.success }]}>
                    Save ${savings.toFixed(2)}
                  </Text>
                </>
              )}
            </View>
            
            <RatingStars />
            
            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
              {item.reviews.length} reviews (avg: {averageRating.toFixed(1)})
            </Text>
            
            {/* Performance Issue: Rendering all tags without virtualization */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
              {item.tags.map((tag, tagIndex) => (
                <Animated.View
                  key={tagIndex}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: theme.tagBackground,
                      transform: [{
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      }],
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.tagText }]}>{tag}</Text>
                </Animated.View>
              ))}
            </ScrollView>
            
            {/* Performance Issue: Expanded content with heavy calculations */}
            {(expandedItems[item.id] || localExpanded) && (
              <View style={styles.expandedContent}>
                <Text style={[styles.description, { color: theme.text }]}>
                  {item.description}
                </Text>
                
                {/* Performance Issue: Rendering price history chart */}
                <View style={styles.priceHistoryContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Price History (30 days)
                  </Text>
                  <View style={styles.chartContainer}>
                    {priceHistory.map((point, i) => (
                      <View
                        key={i}
                        style={[
                          styles.chartBar,
                          {
                            height: (point.price / item.originalPrice) * 50,
                            backgroundColor: point.price < item.price ? theme.success : theme.error,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                
                {/* Performance Issue: Rendering rating distribution */}
                <View style={styles.ratingDistribution}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Rating Distribution
                  </Text>
                  {ratingDistribution.map(({ rating, count }) => (
                    <View key={rating} style={styles.ratingRow}>
                      <Text style={[styles.ratingLabel, { color: theme.text }]}>
                        {rating}★
                      </Text>
                      <View style={styles.ratingBar}>
                        <View
                          style={[
                            styles.ratingFill,
                            {
                              width: `${(count / item.reviews.length) * 100}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
                        {count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Performance Issue: No keyExtractor optimization
  const renderItem = ({ item, index }) => (
    <ProductItem item={item} index={index} />
  );
  
  // Performance Issue: Footer with expensive calculations
  const ListFooter = () => {
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = totalValue / products.length;
    const mostExpensive = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);
    
    return (
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Text style={[styles.footerText, { color: theme.text }]}>
          Total Products: {products.length} | 
          Average: ${averagePrice.toFixed(2)} | 
          Most Expensive: {mostExpensive?.name}
        </Text>
      </View>
    );
  };
  
  return (
    <FlatList
      ref={listRef}
      data={products}
      renderItem={renderItem}
      // Performance Issue: Missing optimization props
      ListFooterComponent={ListFooter}
      onScroll={({ nativeEvent }) => {
        // Performance Issue: Heavy calculation on scroll
        const offset = nativeEvent.contentOffset.y;
        const visibleItems = Math.floor(offset / ITEM_HEIGHT);
        console.log(`Visible items: ${visibleItems} - ${visibleItems + 10}`);
      }}
      scrollEventThrottle={1} // Performance Issue: Too frequent scroll events
    />
  );
};

const styles = StyleSheet.create({
  productItem: {
    margin: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007bff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  savings: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 12,
    marginBottom: 5,
  },
  tagsScroll: {
    marginTop: 5,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  tagText: {
    fontSize: 11,
  },
  expandedContent: {
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceHistoryContainer: {
    marginBottom: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'flex-end',
  },
  chartBar: {
    width: 8,
    marginRight: 2,
  },
  ratingDistribution: {
    marginTop: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingLabel: {
    width: 30,
    fontSize: 12,
  },
  ratingBar: {
    flex: 1,
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  ratingFill: {
    height: '100%',
    borderRadius: 8,
  },
  ratingCount: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default ProductList;