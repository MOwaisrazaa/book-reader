import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { averageHashFromBase64Png, getImageSearchStatus, searchImageHashes } from '../utils/imageSearchEngine';

const PRESETS = [
  { key: 'full', label: 'Full Page' },
  { key: 'center', label: 'Center' },
  { key: 'top', label: 'Top' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'text', label: 'Text Area' },
];

function clampRect(rect, imageWidth, imageHeight) {
  const originX = Math.max(0, Math.min(imageWidth - 1, Math.round(rect.originX)));
  const originY = Math.max(0, Math.min(imageHeight - 1, Math.round(rect.originY)));
  const width = Math.max(16, Math.min(imageWidth - originX, Math.round(rect.width)));
  const height = Math.max(16, Math.min(imageHeight - originY, Math.round(rect.height)));
  return { originX, originY, width, height };
}

function presetRect(preset, width, height) {
  if (preset === 'top') return { originX: 0, originY: 0, width, height: height * 0.42 };
  if (preset === 'bottom') return { originX: 0, originY: height * 0.58, width, height: height * 0.42 };
  if (preset === 'center') return { originX: width * 0.12, originY: height * 0.25, width: width * 0.76, height: height * 0.50 };
  if (preset === 'text') return { originX: width * 0.08, originY: height * 0.10, width: width * 0.84, height: height * 0.82 };
  return { originX: 0, originY: 0, width, height };
}

function secondaryRects(width, height) {
  return [
    { originX: 0, originY: 0, width, height },
    { originX: width * 0.10, originY: height * 0.10, width: width * 0.80, height: height * 0.80 },
    { originX: 0, originY: 0, width, height: height * 0.50 },
    { originX: 0, originY: height * 0.50, width, height: height * 0.50 },
    { originX: width * 0.15, originY: height * 0.25, width: width * 0.70, height: height * 0.45 },
  ];
}

async function makeHash(uri, cropRect) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      { crop: cropRect },
      { resize: { width: 256, height: 256 } },
    ],
    {
      base64: true,
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
    }
  );

  return averageHashFromBase64Png(result.base64);
}

export default function ImageSearch({ visible, onClose, onSelectPage }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activePreset, setActivePreset] = useState('full');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const status = useMemo(() => getImageSearchStatus(results), [results]);

  const pickImage = async (source) => {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Image search needs permission to read/capture an image.');
      return;
    }

    const response = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })
      : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

    if (response.canceled || !response.assets?.[0]) return;

    setSelectedImage(response.assets[0]);
    setResults([]);
    setStatusText('Image selected. Choose a preset, then press Search.');
  };

  const runSearch = async () => {
    if (!selectedImage?.uri) {
      Alert.alert('Select image', 'Pehle gallery ya camera se image select karein.');
      return;
    }

    try {
      setLoading(true);
      setStatusText('Preparing offline visual fingerprints...');

      const baseRect = clampRect(
        presetRect(activePreset, selectedImage.width, selectedImage.height),
        selectedImage.width,
        selectedImage.height
      );
      const queryHashes = [];
      queryHashes.push(await makeHash(selectedImage.uri, baseRect));

      for (const rect of secondaryRects(baseRect.width, baseRect.height)) {
        const nested = clampRect({
          originX: baseRect.originX + rect.originX,
          originY: baseRect.originY + rect.originY,
          width: rect.width,
          height: rect.height,
        }, selectedImage.width, selectedImage.height);
        queryHashes.push(await makeHash(selectedImage.uri, nested));
      }

      const uniqueHashes = Array.from(new Set(queryHashes));
      const matches = searchImageHashes(uniqueHashes, 8);
      setResults(matches);
      setStatusText(getImageSearchStatus(matches).message);
    } catch (error) {
      console.error('[ImageSearch] Search failed:', error);
      Alert.alert('Image search error', error.message || 'Image search failed.');
      setStatusText('Search failed. Try another image or crop.');
    } finally {
      setLoading(false);
    }
  };

  const openPage = (result) => {
    if (!result.usable) {
      Alert.alert('Low confidence', 'Exact page confidently nahi mili. Clear full page ya tighter crop try karein.');
      return;
    }

    onSelectPage(result.page);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={26} color="#F8D889" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Image Search</Text>
            <Text style={styles.headerSubtitle}>Offline page & crop matching</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="image" size={24} color="#F8D889" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={22} color="#F8D889" />
            <Text style={styles.infoText}>
              Ye feature internet ke baghair local page/tile fingerprints se match karta hai. Clear screenshot/crop par best result milta hai.
            </Text>
          </View>

          <View style={styles.sourceRow}>
            <TouchableOpacity style={styles.sourceButton} onPress={() => pickImage('gallery')}>
              <Ionicons name="images" size={22} color="#0D3B2E" />
              <Text style={styles.sourceText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sourceButton} onPress={() => pickImage('camera')}>
              <Ionicons name="camera" size={22} color="#0D3B2E" />
              <Text style={styles.sourceText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.previewCard}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="contain" />
              <Text style={styles.previewText}>Selected image</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Match Area</Text>
          <View style={styles.presetRow}>
            {PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.key}
                style={[styles.presetChip, activePreset === preset.key && styles.presetChipActive]}
                onPress={() => setActivePreset(preset.key)}
              >
                <Text style={[styles.presetText, activePreset === preset.key && styles.presetTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.searchButton, loading && styles.searchButtonDisabled]} onPress={runSearch} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#0D3B2E" />
            ) : (
              <>
                <Ionicons name="scan" size={22} color="#0D3B2E" />
                <Text style={styles.searchText}>Search Exact Page</Text>
              </>
            )}
          </TouchableOpacity>

          {!!statusText && (
            <View style={[styles.statusCard, !status.confident && results.length > 0 && styles.statusWarning]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          )}

          {results.length > 0 && (
            <View style={styles.resultsBlock}>
              <Text style={styles.sectionTitle}>Results</Text>
              {results.map((result, index) => (
                <TouchableOpacity
                  key={`${result.page}-${index}`}
                  style={[styles.resultCard, !result.usable && styles.resultWeak]}
                  onPress={() => openPage(result)}
                >
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultRank}>#{index + 1}</Text>
                  </View>
                  <View style={styles.resultBody}>
                    <Text style={styles.resultTitle}>Page {result.page}</Text>
                    <Text style={styles.resultMeta}>
                      Confidence {result.confidence}% • distance {result.distance} • {result.reason}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#B78A2F" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
  },
  header: {
    backgroundColor: '#071B14',
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(248,216,137,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#D7C8A1',
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 38,
  },
  infoCard: {
    backgroundColor: '#0D3B2E',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: '#F5E8C8',
    fontSize: 13,
    lineHeight: 19,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sourceButton: {
    flex: 1,
    backgroundColor: '#F8D889',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sourceText: {
    color: '#0D3B2E',
    fontWeight: '800',
    fontSize: 15,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    marginTop: 16,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 18,
    backgroundColor: '#E8E1D4',
  },
  previewText: {
    color: '#6B5D45',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
  sectionTitle: {
    color: '#16251E',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2D6BF',
  },
  presetChipActive: {
    backgroundColor: '#0D3B2E',
    borderColor: '#0D3B2E',
  },
  presetText: {
    color: '#62553F',
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#F8D889',
  },
  searchButton: {
    marginTop: 18,
    backgroundColor: '#F8D889',
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  searchButtonDisabled: {
    opacity: 0.65,
  },
  searchText: {
    color: '#0D3B2E',
    fontSize: 16,
    fontWeight: '900',
  },
  statusCard: {
    backgroundColor: '#E5F2EA',
    borderRadius: 16,
    padding: 13,
    marginTop: 14,
  },
  statusWarning: {
    backgroundColor: '#FFF2D6',
  },
  statusText: {
    color: '#233A2E',
    fontWeight: '700',
    textAlign: 'center',
  },
  resultsBlock: {
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#0D3B2E',
    elevation: 2,
  },
  resultWeak: {
    opacity: 0.72,
    borderLeftColor: '#B78A2F',
  },
  resultBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0D3B2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultRank: {
    color: '#F8D889',
    fontWeight: '900',
  },
  resultBody: {
    flex: 1,
  },
  resultTitle: {
    color: '#1D1D1D',
    fontSize: 18,
    fontWeight: '900',
  },
  resultMeta: {
    color: '#746B5B',
    marginTop: 4,
    fontSize: 12,
  },
});
