import { useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BookReader from './components/BookReader';
import ImageSearch from './components/ImageSearch';
import searchIndex from './assets/searchIndex.json';

export default function App() {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedPage, setSelectedPage] = useState(0);
  const [highlightText, setHighlightText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
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
  };

  const closeSearch = () => {
    setShowSearchModal(false);
    setSearchText('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const goToImageSearchPage = (pageNumber) => {
    setSelectedBook('sham-e-shabistan-e-raza');
    setSelectedPage(pageNumber - 1);
    setHighlightText('');
    setIsReaderOpen(true);
    setShowImageSearchModal(false);
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
      <StatusBar style="light" backgroundColor="#071B14" />
      
      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerContent}>
          <View style={styles.logoMark}>
            <Ionicons name="book" size={28} color="#F8D889" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerEyebrow}>Digital Library</Text>
            <Text style={styles.headerTitle}>Islamic Books</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيم</Text>
        <Text style={styles.headerCaption}>Read, search, and continue your Islamic study offline.</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={openSearch}
        >
          <View style={styles.searchIconBubble}>
            <Ionicons name="search" size={19} color="#0D3B2E" />
          </View>
          <Text style={styles.searchPlaceholder}>Search words in books...</Text>
          <Ionicons name="arrow-forward" size={18} color="#B78A2F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeKicker}>Assalamu Alaikum</Text>
            <Text style={styles.welcomeText}>Continue Your Reading</Text>
            <Text style={styles.welcomeSubtext}>A clean offline reader for your Islamic book collection.</Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="sparkles" size={26} color="#F8D889" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name="library" size={20} color="#F8D889" />
            </View>
            <Text style={styles.sectionTitle}>My Library</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.booksFolder}
            onPress={() => openBook('sham-e-shabistan-e-raza')}
          >
            <View style={styles.bookHeroTop}>
              <View style={styles.folderIcon}>
                <Ionicons name="book" size={34} color="#F8D889" />
              </View>
              <View style={styles.bookMeta}>
                <Text style={styles.folderTitle}>Books Collection</Text>
                <Text style={styles.folderSubtitle}>Tap to open your saved Islamic book</Text>
              </View>
              <Ionicons name="chevron-forward-circle" size={30} color="#F8D889" />
            </View>
            
            <View style={styles.booksList}>
              <TouchableOpacity 
                style={styles.bookItem}
                onPress={() => openBook('sham-e-shabistan-e-raza')}
              >
                <View style={styles.bookMiniIcon}>
                  <Ionicons name="reader" size={18} color="#0D3B2E" />
                </View>
                <View style={styles.bookNameBlock}>
                  <Text style={styles.bookName}>Sham-e-Shabistan-e-Raza</Text>
                  <Text style={styles.bookSubName}>896 pages - Offline</Text>
                </View>
                <Ionicons name="arrow-forward" size={17} color="#B78A2F" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name="grid" size={19} color="#F8D889" />
            </View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="bookmark" size={22} color="#0D3B2E" />
              </View>
              <Text style={styles.actionText}>Bookmarks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="time" size={22} color="#0D3B2E" />
              </View>
              <Text style={styles.actionText}>Recent</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => setShowImageSearchModal(true)}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="scan" size={22} color="#0D3B2E" />
              </View>
              <Text style={styles.actionText}>Image Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="settings" size={22} color="#0D3B2E" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quoteSection}>
          <Ionicons name="leaf" size={22} color="#F8D889" />
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

      <ImageSearch
        visible={showImageSearchModal}
        onClose={() => setShowImageSearchModal(false)}
        onSelectPage={goToImageSearchPage}
      />

      <Modal
        visible={showSearchModal}
        transparent={false}
        animationType="none"
        onRequestClose={closeSearch}
        statusBarTranslucent={false}
      >
        <KeyboardAvoidingView
          style={styles.searchOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Ù„ÙØ¸ ØªÙ„Ø§Ø´ Ú©Ø±ÛŒÚº... (Search word)"
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
                  ? 'Ú©ÙˆØ¦ÛŒ Ù†ØªÛŒØ¬Û Ù†ÛÛŒÚº Ù…Ù„Ø§'
                  : `${searchResults.length} ØµÙØ­Ø§Øª Ù…Ù„Û’${searchResults.length === 50 ? ' (Ù¾ÛÙ„Û’ 50)' : ''}`}
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
                    <Text style={styles.searchHintText}>Ú©ÙˆØ¦ÛŒ Ù„ÙØ¸ Ù„Ú©Ú¾ÛŒÚº</Text>
                    <Text style={styles.searchHintSub}>Ø¬Ø³ ØµÙØ­Û’ Ù¾Ø± ÙˆÛ Ù„ÙØ¸ ÛÙˆÚ¯Ø§ ÙˆÛØ§Úº Ú†Ù„Û’ Ø¬Ø§Ø¦ÛŒÚº Ú¯Û’</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
    paddingTop: 36,
  },
  header: {
    backgroundColor: '#071B14',
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#071B14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
  },
  headerGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#174C3B',
    right: -54,
    top: -70,
    opacity: 0.75,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#123B2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,216,137,0.35)',
    marginRight: 14,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#F8D889',
    fontWeight: '800',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 31,
    fontWeight: '900',
    color: '#FFF8E7',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 19,
    color: '#F8D889',
    textAlign: 'center',
    fontFamily: 'serif',
    fontWeight: '700',
    marginBottom: 8,
  },
  headerCaption: {
    color: '#D8E7DD',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 22,
    elevation: 8,
    shadowColor: '#0D3B2E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: '#E7D8B3',
  },
  searchIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EEF6EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#173D31',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 28,
    marginTop: 12,
    marginBottom: 22,
    elevation: 7,
    shadowColor: '#123B2E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE5CC',
  },
  welcomeKicker: {
    fontSize: 12,
    color: '#B78A2F',
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0D3B2E',
    marginBottom: 6,
  },
  welcomeSubtext: {
    maxWidth: 235,
    fontSize: 14,
    color: '#6A746D',
    lineHeight: 21,
    fontWeight: '500',
  },
  welcomeIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#0D3B2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#0D3B2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0D3B2E',
  },
  booksFolder: {
    backgroundColor: '#0D3B2E',
    padding: 18,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#071B14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(248,216,137,0.25)',
  },
  bookHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#174C3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bookMeta: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFF8E7',
    marginBottom: 4,
  },
  folderSubtitle: {
    fontSize: 13,
    color: '#C8D9CF',
    lineHeight: 19,
  },
  booksList: {
    marginTop: 18,
    width: '100%',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    padding: 13,
    borderRadius: 20,
  },
  bookMiniIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E9F2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookNameBlock: {
    flex: 1,
  },
  bookName: {
    fontSize: 15,
    color: '#0D3B2E',
    fontWeight: '900',
  },
  bookSubName: {
    marginTop: 2,
    fontSize: 12,
    color: '#7B7A68',
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 17,
    paddingHorizontal: 10,
    borderRadius: 22,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#0D3B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE5CC',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF6EF',
    marginBottom: 9,
  },
  actionText: {
    fontSize: 12,
    color: '#0D3B2E',
    fontWeight: '900',
  },
  quoteSection: {
    backgroundColor: '#071B14',
    padding: 24,
    borderRadius: 30,
    marginBottom: 34,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#071B14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  quoteArabic: {
    fontSize: 25,
    color: '#F8D889',
    fontFamily: 'serif',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    fontWeight: '800',
  },
  quoteTranslation: {
    fontSize: 15,
    color: '#EAF3EA',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  quoteReference: {
    fontSize: 13,
    color: '#B9CABE',
    textAlign: 'center',
    fontWeight: '800',
  },
  searchOverlay: {
    flex: 1,
    backgroundColor: '#F5F0E6',
    paddingTop: 40,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#F5F0E6',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#071B14',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E7D8B3',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    fontSize: 16,
    color: '#0D3B2E',
    fontWeight: '700',
  },
  cancelBtn: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#F8D889',
    fontWeight: '900',
  },
  resultsCount: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    fontSize: 13,
    color: '#6A746D',
    textAlign: 'center',
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    fontWeight: '800',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#0D3B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE5CC',
  },
  resultPageBadge: {
    backgroundColor: '#0D3B2E',
    borderRadius: 14,
    minWidth: 48,
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginRight: 12,
  },
  resultPageNum: {
    color: '#F8D889',
    fontWeight: '900',
    fontSize: 14,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultSnippet: {
    fontSize: 14,
    color: '#34473F',
    textAlign: 'right',
    lineHeight: 21,
    fontWeight: '500',
  },
  searchHint: {
    alignItems: 'center',
    marginTop: 70,
    paddingHorizontal: 40,
  },
  searchHintText: {
    fontSize: 20,
    color: '#0D3B2E',
    marginTop: 18,
    fontWeight: '900',
  },
  searchHintSub: {
    fontSize: 14,
    color: '#78867D',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '600',
  },
});
