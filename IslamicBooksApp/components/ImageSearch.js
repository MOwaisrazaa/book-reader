import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { searchSimilarImages, getEmbeddingStats, checkServerHealth } from '../utils/imageSearch';

export default function ImageSearch({ visible, onClose, onSelectPage }) {
  const [searching, setSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    if (visible) {
      checkServer();
      if (!stats) {
        getEmbeddingStats().then(setStats);
      }
    }
  }, [visible, stats]);

  const checkServer = async () => {
    const isOnline = await checkServerHealth();
    setServerOnline(isOnline);
    if (!isOnline) {
      Alert.alert(
        'Server Offline',
        'Image search server is not running. Please start the server first.',
        [{ text: 'OK' }]
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        await performSearch(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const performSearch = async (imageUri) => {
    if (!serverOnline) {
      Alert.alert('Error', 'Server is offline. Please start the server.');
      return;
    }

    try {
      setSearching(true);
      setSearchResults([]);
      const results = await searchSimilarImages(imageUri, 5);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (pageId) => {
    onSelectPage(pageId);
    onClose();
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectResult(item.pageId)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultPage}>Page {item.pageId}</Text>
        <Text style={styles.resultSimilarity}>
          Match: {(item.similarity * 100).toFixed(1)}%
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#1B5E20" />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Image Search</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!serverOnline && (
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color="#E65100" />
              <Text style={styles.warningText}>Server is offline</Text>
              <Text style={styles.warningSubtext}>Start the Node.js server to use image search</Text>
            </View>
          )}

          {stats && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Search Index</Text>
              <Text style={styles.statsText}>📚 {stats.totalEmbeddings} pages indexed</Text>
              <Text style={styles.statsText}>🧠 {stats.model}</Text>
              <Text style={styles.statsText}>📊 Dimension: {stats.embeddingDimension}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Image</Text>
            <TouchableOpacity
              style={[styles.uploadButton, !serverOnline && styles.uploadButtonDisabled]}
              onPress={pickImage}
              disabled={searching || !serverOnline}
            >
              <Ionicons name="image" size={40} color={serverOnline ? '#1B5E20' : '#ccc'} />
              <Text style={[styles.uploadButtonText, !serverOnline && styles.uploadButtonTextDisabled]}>
                {selectedImage ? 'Change Image' : 'Pick from Gallery'}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Image</Text>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            </View>
          )}

          {searching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1B5E20" />
              <Text style={styles.loadingText}>Searching similar pages...</Text>
            </View>
          )}

          {searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Similar Pages ({searchResults.length})</Text>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.pageId.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {!searching && selectedImage && searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No similar pages found</Text>
            </View>
          )}

          {!selectedImage && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How it works</Text>
              <Text style={styles.instructionsText}>
                1. Select an image from your gallery{'\n'}
                2. Server generates vector embedding{'\n'}
                3. Finds similar pages in database{'\n'}
                4. Tap a result to view that page
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
    alignItems: 'center',
  },
  warningText: { fontSize: 14, fontWeight: '600', color: '#E65100', marginTop: 8 },
  warningSubtext: { fontSize: 12, color: '#BF360C', marginTop: 4 },
  statsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E20',
  },
  statsTitle: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginBottom: 8 },
  statsText: { fontSize: 13, color: '#2E7D32', marginVertical: 4 },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginTop: 12 },
  uploadButtonTextDisabled: { color: '#ccc' },
  previewImage: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#e0e0e0' },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E20',
  },
  resultContent: { flex: 1 },
  resultPage: { fontSize: 14, fontWeight: '600', color: '#333' },
  resultSimilarity: { fontSize: 12, color: '#666', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 14, color: '#999', marginTop: 12 },
  instructionsCard: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16, marginBottom: 24 },
  instructionsTitle: { fontSize: 14, fontWeight: '600', color: '#E65100', marginBottom: 8 },
  instructionsText: { fontSize: 13, color: '#BF360C', lineHeight: 20 },
});
