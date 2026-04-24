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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#C8E6C9',
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  pageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1B5E20',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  pageInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  pageInfoSeparator: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 4,
  },
  pageInfoTotal: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#1B5E20',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default BookReader;
