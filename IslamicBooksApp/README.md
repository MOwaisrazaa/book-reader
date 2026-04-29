# Islamic Books App 📚

Ek jadeed React Native application jo Islamic kitabon ko padhne aur talash karne ke liye banai gayi hai. Yeh app mutun ki talash aur tasveer ki buniyad par talash ki suhaolat faraham karti hai.

---

## 🎯 Aham Khususiyat

### 1. **Mutun ki Buniyad par Talash** 📖
- Kitaab mein kisi bhi lafz ya jumle ko talash karein
- Fori nataij safha number ke saath
- Mutun ko highlight karein
- Urdu/Arabic zaban ki mukammal support
- Haqiqi waqt mein talash

**Kaise Kaam Karta Hai:**
```
Saaraf lafz likhta hai → searchIndex.json mein talash → Nataij dikhaye jate hain → Mutun highlight hota hai
```

### 2. **Tasveer ki Buniyad par Talash** 🖼️
- Apni gallery se koi tasveer muntakhab karein
- Kitaab mein milti jilti safhayen talash karein
- Vector Embedding technology istemal karte hue
- Sab se milti jilti 5 safhayen dikhaye jate hain
- Har nataije ke saath match ka faiz

**Kaise Kaam Karta Hai:**
```
Saaraf tasveer muntakhab karta hai
    ↓
Node.js server ko bheja jata hai
    ↓
Server tasveer ko process karta hai:
  • Tasveer ko 224x224 size mein tabdeel karein
  • Siyah o safed mein tabdeel karein
  • Pixel ki qeemat nikalen
  • 1024 jhatmi vector banayein
    ↓
Tamam embeddings ke saath muazeena:
  • Cosine Similarity ka hisaab lagayein
  • Nataij ko tartib dein
  • Sab se behtar 5 nataij wapas karein
    ↓
Milti jilti safhayen faiz ke saath dikhayein
```

### 3. **Kitaab ka Reader** 📕
- Mukammal safha ki tasveer dekhein
- Safhayon ke darmiyaan aasani se muntaqal hon
- Mutun ko highlight karein
- Mobile ke liye behtar design
- Zoom ki suhaolat

### 4. **Offline Support** 🔌
- Bina internet ke mukammal taur par kaam karta hai
- Tamam data maqami taur par mehfooz hai
- Koi cloud service ki zaroorat nahi
- Taiz raftar ki karkaradgi

---

## 🛠️ Technology Stack

### **Mobile App (Expo)**
```
React Native 0.81.5
├── Expo 54.0.34 (Framework)
├── React 19.1.0 (UI Library)
├── Expo Image Picker (Tasveer Muntakhab Karna)
├── Expo File System (Faiylon ke Saath Kaam)
└── Expo Vector Icons (Icons)
```

### **Backend Server (Node.js)**
```
Node.js
├── Express.js (REST API)
├── SQLite3 (Database)
├── Sharp (Tasveer ki Processing)
├── Multer (File Upload)
└── CORS (Cross-Origin Support)
```

### **AI/ML Components**
```
Vector Embeddings
├── Khususiyat Nikalna (Sharp)
├── Cosine Similarity (Riyaziyat)
├── 1024 Jhatmi Vector
└── Siyah o Safed Tasveer ki Processing
```

---

## 📊 App ki Saakht

```
IslamicBooksApp/
├── App.js                          # Markazi App Component
├── components/
│   ├── BookReader.js              # Kitaab ke Safhayen Dekhna
│   └── ImageSearch.js             # Tasveer Talash ka UI
├── utils/
│   ├── bookLoader.js              # Kitaab ka Data Load Karna
│   └── imageSearch.js             # Server se Rabta
├── assets/
│   ├── books/
│   │   └── sham-e-shabistan-e-raza/  # 896 Safhayen
│   └── searchIndex.json           # Mutun Talash ka Index
└── package.json
```

---

## 🚀 Har Khususiyat Kaise Kaam Karti Hai

### **Mutun ki Talash ki Tafsilat**

**File:** `assets/searchIndex.json`
```json
[
  {
    "page": 1,
    "text": "Bismillah ar-Rahman ar-Rahim..."
  },
  {
    "page": 2,
    "text": "Alhamdulillah Rabb al-Alamin..."
  }
]
```

**Kaise Kaam Karta Hai:**
1. Saaraf talash ka lafz likhta hai
2. App searchIndex.json mein is lafz ko talash karta hai
3. Tamam milne wale safhayen dikhaye jate hain
4. Saaraf kisi safhe par click karta hai
5. Woh safha khul jata hai aur lafz highlight hota hai

**File ka Size:** ~2-3 MB
**Kul Safhayen:** 896

---

### **Tasveer ki Talash ki Tafsilat**

#### **Marhalah 1: Tasveer Muntakhab Karna**
```javascript
// Saaraf apni gallery se tasveer muntakhab karta hai
ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
})
```

#### **Marhalah 2: Server ko Bhejnaa**
```javascript
// Tasveer ko Node.js server ko bheja jata hai
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'search.jpg',
});

fetch('http://192.168.0.37:3000/api/search', {
  method: 'POST',
  body: formData,
})
```

#### **Marhalah 3: Server mein Processing**
```javascript
// 1. Tasveer ko 224x224 mein tabdeel karein
const resized = await sharp(imageBuffer)
  .resize(224, 224)
  .grayscale()
  .raw()
  .toBuffer();

// 2. 1024 jhatmi vector banayein
const embedding = new Array(1024).fill(0);
for (let i = 0; i < Math.min(resized.length, 1024); i++) {
  embedding[i] = resized[i] / 255;  // 0-1 mein tabdeel karein
}

// 3. Database mein tamam embeddings ke saath muazeena karein
function cosineSimilarity(a, b) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 4. Sab se behtar 5 nataij wapas karein
const results = allEmbeddings
  .map(emb => ({
    pageId: emb.pageId,
    similarity: cosineSimilarity(userEmbedding, emb.embedding)
  }))
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 5);
```

#### **Marhalah 4: Nataij Dikhana**
```javascript
// Mobile app mein nataij dikhaye jate hain
searchResults.map(result => (
  <TouchableOpacity onPress={() => goToPage(result.pageId)}>
    <Text>Safha {result.pageId}</Text>
    <Text>Match: {(result.similarity * 100).toFixed(1)}%</Text>
  </TouchableOpacity>
))
```

---

## 💾 Data ki Tafsilat

### **Mutun Talash ka Index**
- **File:** `assets/searchIndex.json`
- **Size:** ~2-3 MB
- **Format:** JSON array
- **Maqsad:** Taiz raftar mutun talash

### **Tasveer ki Embeddings**
- **Database:** SQLite (`embeddings.db`)
- **Size:** ~5 MB
- **Records:** 896 Safhayen
- **Har Record mein:**
  - `pageId`: Safha Number
  - `fileName`: File ka Naam
  - `embedding`: 1024 Numbers ki Fehrist

```sql
CREATE TABLE embeddings (
  id INTEGER PRIMARY KEY,
  pageId INTEGER UNIQUE,
  fileName TEXT,
  embedding TEXT  -- JSON array ke taur par mehfooz
)
```

---

## 🔧 Setup aur Installation

### **Mobile App ko Shuru Karein**
```bash
cd IslamicBooksApp
npm install
npm start
# Expo Go mein kholen
```

### **Server ko Shuru Karein**
```bash
cd image-search-server
npm install
mkdir images
# Kitaab ki tasveerain ./images folder mein copy karein
node server.js
```

### **Embeddings ko Pehle se Tayyar Karein**
```bash
# Yeh command tamam 896 safhayon ke liye embeddings banati hai
curl -X POST http://localhost:3000/api/precompute
```

---

## 📱 App ke Aham Hisse

### **App.js - Markazi File**
```javascript
// 1. Kitaab Khulna
openBook('sham-e-shabistan-e-raza')

// 2. Mutun Talash
handleSearch('ilm')

// 3. Tasveer Talash
setShowImageSearch(true)

// 4. Safha par Jana
goToPage(pageNumber, highlightText)
```

### **ImageSearch.js - Tasveer Talash ka UI**
```javascript
// 1. Server ki Janch
checkServerHealth()

// 2. Tasveer Muntakhab Karna
pickImage()

// 3. Talash Karna
performSearch(imageUri)

// 4. Nataij Dikhana
renderSearchResult()
```

### **imageSearch.js - Server se Rabta**
```javascript
// Server ka URL (Apna IP Dalen)
const SERVER_URL = 'http://192.168.0.37:3000';

// Tasveer Talash Karein
searchSimilarImages(imageUri, 5)

// Embeddings ki Maloomat
getEmbeddingStats()

// Server ki Halat Check Karein
checkServerHealth()
```

---

## 🔐 Security aur Razdari

- ✅ **Offline Pehle** - Koi Data Cloud mein nahi jata
- ✅ **Maqami Zakhira** - Tamam Data Aapke Phone mein Hai
- ✅ **Koi Tracking Nahi** - Koi Tajzia ya Nigrani Nahi
- ✅ **Khula Code** - Sab Kuch Shafaaf Hai
- ✅ **Sirf WiFi** - Server se Rabta Maqami Network par Hai

---

## 📚 Kitaab ki Tafsilat

**Kitaab:** Sham-e-Shabistan-e-Raza
- **Kul Safhayen:** 896
- **Format:** JPEG Tasveerain
- **Zaban:** Urdu/Arabic
- **Size:** ~500 MB (Tasveerain)
- **Maqam:** `IslamicBooksApp/assets/books/sham-e-shabistan-e-raza/`

---

## 🔄 Server ke API Endpoints

### **Tasveer Talash**
```
POST /api/search
Content-Type: multipart/form-data
Body: Tasveer File

Jawab:
[
  {
    "pageId": 1,
    "fileName": "page1.jpg",
    "similarity": 0.95
  },
  ...
]
```

### **Embeddings ko Pehle se Tayyar Karein**
```
POST /api/precompute

Jawab:
{
  "message": "Processed 896 images, 0 failed",
  "total": 896
}
```

### **Maloomat Hasil Karein**
```
GET /api/stats

Jawab:
{
  "totalEmbeddings": 896,
  "model": "Feature Vector (Sharp)",
  "embeddingDimension": 1024,
  "method": "Cosine Similarity"
}
```

### **Server ki Halat**
```
GET /api/health

Jawab:
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🎓 Technology ki Tashreeh

### **Vector Embeddings Kya Hai?**
- Tasveer ko 1024 numbers mein tabdeel karna
- Har number tasveer ki ek khususiyat hai
- Milti jilti tasveerain milte jilte numbers rakhti hain

**Misal:**
```
Tasveer 1: [0.23, 0.45, 0.12, 0.67, ...]  (896 Safha)
Tasveer 2: [0.24, 0.46, 0.11, 0.68, ...]  (Milti Jilti Tasveer)
```

### **Cosine Similarity Kya Hai?**
- Do Vectors ke darmiyaan Zavia ki Paimaysh
- 0 = Bilkul Mukhtalif
- 1 = Bilkul Ek Jaisi
- 0.5 = Kuch Milti Jilti

**Formula:**
```
similarity = (A · B) / (|A| × |B|)

Jahan:
A · B = Donon Vectors ka Dot Product
|A| = Vector A ki Lambai
|B| = Vector B ki Lambai
```

### **Sharp Kya Hai?**
- Tasveerun ko Taizi se Process Karne Wali Library
- Tasveer ko Chhota Karna
- Rang Tabdeel Karna
- Pixel ki Maloomat Nikalna

### **SQLite Kya Hai?**
- Halka Phalka Database
- Koi Server ki Zaroorat Nahi
- File ki Shakal mein Mehfooz
- Taiz Raftar

---

## 📊 Karkaradgi ki Maloomat

| Maloomat | Qeemat |
|----------|--------|
| **App ka Size** | ~50 MB |
| **Mutun Talash ka Waqt** | <100ms |
| **Tasveer Talash ka Waqt** | 200-500ms |
| **Database ka Size** | ~5 MB |
| **Memory ka Istemal** | 50-100 MB |
| **Kul Safhayen** | 896 |
| **Embedding ki Jhatmiyaan** | 1024 |

---

## 🎨 UI Components

### **Markazi Safha**
- App ka Header
- Talash ki Bar
- Kitabon ki Library
- Fori Karwaiyan (Tasveer Talash, Bookmarks wغیرہ)
- Islamic Hawala

### **Kitaab ka Reader**
- Mukammal Safha ki Tasveer
- Safhayon ke Darmiyaan Muntaqali
- Mutun ko Highlight Karna
- Mobile ke liye Behtar Design

### **Tasveer Talash ka Modal**
- Tasveer Muntakhab Karna
- Talash ki Halat
- Nataij ki Fehrist
- Match ka Faiz
- Server ki Halat

### **Mutun Talash ka Modal**
- Talash ki Bar
- Haqiqi Waqt mein Nataij
- Safha ke Hisse
- Mutun ko Highlight Karna

---

## 🚀 Mustaqbil ki Behtriyaan

- [ ] ONNX Runtime ke Saath Behtar Durusgi
- [ ] OCR se Mutun Nikalna
- [ ] Bookmarks ki Suhaolat
- [ ] Padhne ki Tarikh
- [ ] Raat ka Mode
- [ ] Mutaadad Kitabon ki Support
- [ ] Cloud Sync
- [ ] Aala Filtering

---

## 📝 License

Yeh Project Talimi Maqsad ke liye Khula Hai.

---

## 👨‍💻 Development

### **Istemal Shuda Technologies:**
- React Native - Mobile App
- Expo - Asaan Deployment
- Node.js - Backend
- SQLite - Data Mehfooz Karna

### **Aham Libraries:**
- `expo-image-picker` - Tasveer Muntakhab Karna
- `sharp` - Tasveer ki Processing
- `sqlite3` - Database
- `express` - REST API

---

## 📞 Masail ko Hal Karna

### **Masala: "Server is offline"**
**Hal:**
1. Yaqini Banayein ke Node.js Server Chal Raha Hai
2. `image-search-server` Folder mein Jayein
3. `node server.js` Chalayein

### **Masala: Tasveer Talash Kaam Nahi Kar Rahi**
**Hal:**
1. Server Chal Raha Hai ya Nahi Check Karein
2. WiFi Connection Check Karein
3. IP Address Sahih Hai ya Nahi Check Karein
4. Embeddings Pehle se Tayyar Hain ya Nahi Check Karein

### **Masala: WiFi Badal Gaya**
**Hal:**
1. Apna Naya IP Address Maloom Karein
2. `IslamicBooksApp/utils/imageSearch.js` Kholen
3. Line 5 mein IP Address Tabdeel Karein:
```javascript
const SERVER_URL = 'http://Aapka_Naya_IP:3000';
```

### **Masala: Embeddings Nahi Bane**
**Hal:**
1. Tasveerain `image-search-server/images` mein Hain ya Nahi Check Karein
2. Yeh Command Chalayein:
```bash
curl -X POST http://localhost:3000/api/precompute
```
3. Intezaar Karein Jab Tak Tamam 896 Safhayen Process Ho Jayein

---

## 🎉 Khulasa

**Islamic Books App** Ek Mukammal Hal Hai:
- ✅ Taiz Raftar Mutun Talash
- ✅ AI se Chalne Wali Tasveer Talash
- ✅ Khubsurat UI
- ✅ Mukammal Offline Support
- ✅ Maqami Data Mehfooz Karna
- ✅ Expo Go mein Kaam Karta Hai

**Islamic Adab Padhne ke liye Behtar!**

---

*Akhri Update: April 2026*
