import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

// Performance Issue: No debouncing on search input
const SearchBar = ({ onSearch, placeholder, value }) => {
  const [searchText, setSearchText] = useState(value || '');

  // Performance Issue: Calling parent function on every keystroke
  const handleTextChange = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  // Performance Issue: Creating new function on every render
  const clearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={searchText}
        onChangeText={handleTextChange}
        // Performance Issue: No optimization props
      />
      {searchText.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearSearch}
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 22.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearText: {
    fontSize: 18,
    color: '#999',
  },
});

export default SearchBar;