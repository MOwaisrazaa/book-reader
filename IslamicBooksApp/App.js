import { useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BookReader from './components/BookReader';
import ImageSearch from './components/ImageSearch';
import searchIndex from './assets/searchIndex.json';

export default function App() {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedPage, setSelectedPage] = useState(0);
  const [highlightText, setHighlightText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  const openBook = (bookName) => {
    setSelectedBook(bookName);
    setSelectedPage(0);
    setHighlightText('');
    setIsReaderOpen(true);
  };

  const closeReader = () => {
    setIsReaderOpen(false);
    setSelectedBook('');
    setSelectedPage(0);
    setHighlightText('');
  };

  const handleSearch = useCallback((query) => {
    setSearchText(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.trim().toLowerCase();
    const results = searchIndex
      .filter(item => item.text.toLowerCase().includes(q))
      .slice(0, 50);
    setSearchResults(results);
  }, []);

  const goToPage = (pageNumber, textToHighlight) => {
    setSelectedBook('sham-e-shabistan-e-raza');
    setSelectedPage(pageNumber - 1);
    setHighlightText(textToHighlight);
    setIsReaderOpen(true);
    setShowSearchModal(false);
    setSearchText('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const openSearch = () => {
    setShowSearchModal(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setShowSearchModal(false);
    setSearchText('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleImageSearchSelect = (pageNumber) => {
    setSelectedBook('sham-e-shabistan-e-raza');
    setSelectedPage(pageNumber - 1);
    setHighlightText('');
    setIsReaderOpen(true);
    setShowImageSearch(false);
  };

  const getSnippet = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text.slice(0, 80);
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + query.length + 50);
    return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
  };

  const renderHighlightedText = (text, query) => {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const textParts = text.split(regex);
    
    return textParts.map((part, index) => {
      if (part && part.toLowerCase() === query.toLowerCase()) {
        return (
          <Text key={index} style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B5E20" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="book" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Islamic Books</Text>
        </View>
        <Text style={styles.headerSubtitle}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={openSearch}
        >
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search in books...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.welcomeSubtext}>Start your spiritual journey with Islamic literature</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library" size={24} color="#2E7D32" />
            <Text style={styles.sectionTitle}>My Library</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.booksFolder}
            onPress={() => openBook('sham-e-shabistan-e-raza')}
          >
            <View style={styles.folderIcon}>
              <Ionicons name="folder-open" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.folderTitle}>Books Collection</Text>
            <Text style={styles.folderSubtitle}>Tap to read your Islamic books</Text>
            
            <View style={styles.booksList}>
              <TouchableOpacity 
                style={styles.bookItem}
                onPress={() => openBook('sham-e-shabistan-e-raza')}
              >
                <Ionicons name="book" size={20} color="#4CAF50" />
                <Text style={styles.bookName}>Sham-e-Shabistan-e-Raza</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => setShowImageSearch(true)}
            >
              <Ionicons name="image" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Image Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="bookmark" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Bookmarks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="time" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Recent</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="settings" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quoteSection}>
          <Text style={styles.quoteArabic}>وَقُل رَّبِّ زِدْنِي عِلْمًا</Text>
          <Text style={styles.quoteTranslation}>"And say: My Lord, increase me in knowledge"</Text>
          <Text style={styles.quoteReference}>- Quran 20:114</Text>
        </View>

      </ScrollView>

      <BookReader 
        visible={isReaderOpen}
        onClose={closeReader}
        bookName={selectedBook}
        initialPage={selectedPage}
        highlightText={highlightText}
      />

      <Modal
        visible={showSearchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeSearch}
      >
        <KeyboardAvoidingView
          style={styles.searchOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="لفظ تلاش کریں... (Search word)"
                  placeholderTextColor="#aaa"
                  value={searchText}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  textAlign="right"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {searchText.trim().length > 0 && (
              <Text style={styles.resultsCount}>
                {searchResults.length === 0
                  ? 'کوئی نتیجہ نہیں ملا'
                  : `${searchResults.length} صفحات ملے${searchResults.length === 50 ? ' (پہلے 50)' : ''}`}
              </Text>
            )}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.page)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem} 
                  onPress={() => goToPage(item.page, searchText)}
                >
                  <View style={styles.resultPageBadge}>
                    <Text style={styles.resultPageNum}>{item.page}</Text>
                  </View>
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultSnippet} numberOfLines={2}>
                      {renderHighlightedText(getSnippet(item.text, searchText), searchText)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#1B5E20" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchText.trim().length === 0 ? (
                  <View style={styles.searchHint}>
                    <Ionicons name="search-outline" size={48} color="#ddd" />
                    <Text style={styles.searchHintText}>کوئی لفظ لکھیں</Text>
                    <Text style={styles.searchHintSub}>جس صفحے پر وہ لفظ ہوگا وہاں چلے جائیں گے</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ImageSearch 
        visible={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSelectPage={handleImageSearchSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 40,
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C8E6C9',
    textAlign: 'center',
    fontFamily: 'serif',
    fontWeight: '500',
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: '#1B5E20',
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#1B5E20',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 10,
  },
  booksFolder: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderStyle: 'dashed',
  },
  folderIcon: {
    marginBottom: 16,
  },
  folderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6,
  },
  folderSubtitle: {
    fontSize: 15,
    color: '#777',
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderTopWidth: 3,
    borderTopColor: '#1B5E20',
  },
  actionText: {
    fontSize: 15,
    color: '#1B5E20',
    fontWeight: '700',
    marginTop: 10,
  },
  quoteSection: {
    backgroundColor: '#E8F5E9',
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderLeftWidth: 6,
    borderLeftColor: '#1B5E20',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quoteArabic: {
    fontSize: 24,
    color: '#1B5E20',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  quoteTranslation: {
    fontSize: 17,
    color: '#2E7D32',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  quoteReference: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  booksList: {
    marginTop: 16,
    width: '100%',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8F6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E20',
  },
  bookName: {
    flex: 1,
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
    marginLeft: 12,
  },
  searchOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: { 
    marginRight: 6 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#333' 
  },
  cancelBtn: { 
    marginLeft: 10, 
    paddingVertical: 6, 
    paddingHorizontal: 4 
  },
  cancelText: { 
    fontSize: 15, 
    color: '#1B5E20', 
    fontWeight: '600' 
  },
  resultsCount: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  resultPageBadge: {
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    minWidth: 44,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    marginRight: 12,
  },
  resultPageNum: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  resultTextContainer: { 
    flex: 1 
  },
  resultSnippet: { 
    fontSize: 14, 
    color: '#444', 
    textAlign: 'right', 
    lineHeight: 20 
  },
  searchHint: { 
    alignItems: 'center', 
    marginTop: 60, 
    paddingHorizontal: 40 
  },
  searchHintText: { 
    fontSize: 18, 
    color: '#aaa', 
    marginTop: 16, 
    fontWeight: '600' 
  },
  searchHintSub: { 
    fontSize: 14, 
    color: '#ccc', 
    marginTop: 8, 
    textAlign: 'center', 
    lineHeight: 20 
  },
});
