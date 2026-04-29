/**
 * Image Search - ONNX Runtime based vector embedding
 * Server-side processing for Expo Go compatibility
 */

// Server URL - Change to your IP
const SERVER_URL = 'http://192.168.0.37:3000';

export const searchSimilarImages = async (imageUri, limit = 5) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'search.jpg',
    });

    // Send to server
    const response = await fetch(`${SERVER_URL}/api/search`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getEmbeddingStats = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Stats error:', error);
    return {
      totalEmbeddings: 0,
      model: 'Feature Vector',
      embeddingDimension: 1024,
      method: 'Cosine Similarity',
    };
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};
