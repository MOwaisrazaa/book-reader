import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Image, SafeAreaView, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBookImages } from '../utils/bookLoader';

const { width, height } = Dimensions.get('window');

function BookReader({ visible, onClose, bookName, initialPage = 0, highlightText = '' }) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [jumpToPage, setJumpToPage] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);

  useEffect(() => {
    if (visible && bookName) {
      loadBook();
    }
  }, [visible, bookName]);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const bookImages = await getBookImages(bookName);
      setImages(bookImages);
    } catch (error) {
      console.error('Error loading book:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 0 && pageNum < images.length) {
      setCurrentPage(pageNum);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < images.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage) - 1;
    if (pageNum >= 0 && pageNum < images.length) {
      goToPage(pageNum);
      setShowJumpModal(false);
      setJumpToPage('');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{bookName}</Text>
            <Text style={styles.headerSubtitle}>Page {currentPage + 1} of {images.length}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowJumpModal(true)} style={styles.headerButton}>
            <Ionicons name="search" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Book Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B5E20" />
            <Text style={styles.loadingText}>Loading book...</Text>
          </View>
        ) : images.length > 0 ? (
          <View style={styles.contentContainer}>
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="large" color="#1B5E20" />
              </View>
            )}
            <View style={styles.pageWrapper}>
              <Image
                source={images[currentPage]}
                style={styles.pageImage}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(error) => console.log('Image load error:', error)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#999" />
            <Text style={styles.errorText}>No pages found</Text>
          </View>
        )}

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomBar}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentPage + 1) / images.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentPage + 1} / {images.length}
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationBar}>
            <TouchableOpacity
              style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
              onPress={goToPreviousPage}
              disabled={currentPage === 0}
            >
              <Ionicons name="chevron-back" size={28} color={currentPage === 0 ? '#ccc' : '#1B5E20'} />
            </TouchableOpacity>

            <View style={styles.pageInfoContainer}>
              <Text style={styles.pageInfo}>
                {currentPage + 1}
              </Text>
              <Text style={styles.pageInfoSeparator}>/</Text>
              <Text style={styles.pageInfoTotal}>
                {images.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.navButton, currentPage === images.length - 1 && styles.navButtonDisabled]}
              onPress={goToNextPage}
              disabled={currentPage === images.length - 1}
            >
              <Ionicons name="chevron-forward" size={28} color={currentPage === images.length - 1 ? '#ccc' : '#1B5E20'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Jump to Page Modal */}
        <Modal visible={showJumpModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Jump to Page</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter page number"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={jumpToPage}
                onChangeText={setJumpToPage}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowJumpModal(false);
                    setJumpToPage('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleJumpToPage}
                >
                  <Text style={styles.confirmButtonText}>Go</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#071B14',
    marginHorizontal: 10,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#071B14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#123B2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,216,137,0.25)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF8E7',
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#F8D889',
    marginTop: 3,
    fontWeight: '800',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E6',
    padding: 10,
  },
  pageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#0D3B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E7D8B3',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 240, 230, 0.82)',
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0D3B2E',
    fontWeight: '800',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E6',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#78867D',
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: '#FFF8E7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    elevation: 10,
    shadowColor: '#071B14',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderTopWidth: 1,
    borderColor: '#E7D8B3',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E7D8B3',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 7,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D3B2E',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    color: '#78867D',
    textAlign: 'right',
    fontWeight: '800',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 52,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF6EF',
    borderWidth: 1,
    borderColor: '#DDEADC',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  pageInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071B14',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
  },
  pageInfo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8D889',
  },
  pageInfoSeparator: {
    fontSize: 14,
    color: '#D8E7DD',
    marginHorizontal: 6,
    fontWeight: '800',
  },
  pageInfoTotal: {
    fontSize: 14,
    color: '#D8E7DD',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 27, 20, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF8E7',
    borderRadius: 26,
    padding: 22,
    width: '100%',
    elevation: 14,
    shadowColor: '#071B14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: '#E7D8B3',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0D3B2E',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E7D8B3',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    marginBottom: 16,
    color: '#0D3B2E',
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 88,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EFE5CC',
  },
  cancelButtonText: {
    color: '#526158',
    fontWeight: '900',
  },
  confirmButton: {
    backgroundColor: '#0D3B2E',
  },
  confirmButtonText: {
    color: '#F8D889',
    fontWeight: '900',
  },
});
export default BookReader;

