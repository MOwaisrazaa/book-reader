# Islamic Books App

## App Ka Maqsad

Ye ek **Islamic Books Reader App** hai jo React Native (Expo) par bani hai. Is app ka maqsad Islamic literature ko digital form mein padhne ka asaan tareeqa faraham karna hai.

---

## Features

### 1. Book Library
- Islamic books ka collection
- "Sham-e-Shabistan-e-Raza" book included (896 pages)
- Easy navigation between books

### 2. Book Reader
- High-quality page images
- Page-by-page navigation
- Progress bar
- Jump to any page directly

### 3. Text Search
- Urdu text search
- Search results with highlighted text
- Jump directly to the page containing searched text
- Fast search using pre-built index

### 4. Beautiful UI
- Green Islamic theme
- Smooth animations
- Easy-to-use interface
- RTL (Right-to-Left) support for Urdu

---

## Technical Stack

### Framework & Language
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **JavaScript** - Programming language

### Key Dependencies
| Dependency | Purpose |
|------------|---------|
| `expo` | Expo SDK |
| `expo-status-bar` | Status bar styling |
| `expo-image-picker` | Image picker |
| `expo-file-system` | File operations |
| `@expo/vector-icons` | Icons (Ionicons) |

### Data Files
| File | Purpose |
|------|---------|
| `searchIndex.json` | Text search index |
| `bookLoader.js` | Page images mapping |

---

## App Structure

```
IslamicBooksApp/
├── App.js                    # Main app component
├── app.json                  # Expo configuration
├── package.json              # Dependencies
│
├── components/
│   └── BookReader.js         # Book reader component
│
├── utils/
│   └── bookLoader.js         # Book loading utilities
│
├── assets/
│   ├── icon.png              # App icon
│   ├── splash-icon.png       # Splash screen
│   ├── searchIndex.json      # Text search index
│   └── books/
│       └── sham-e-shabistan-e-raza/
│           ├── page1.jpg
│           ├── page2.jpg
│           └── ... (896 pages)
│
└── generateSearchIndex.js    # Search index generator
```

---

## Kaise Use Karen

### App Chalao

```bash
cd IslamicBooksApp
npm install
npx expo start
```

### Phone Mein

1. **Expo Go** app install karo (Play Store se)
2. QR code scan karo jo terminal mein dikh raha hai
3. App load ho jayegi

---

## Features Kaise Use Karen

### 1. Book Padhna

1. Home screen par **"Books Collection"** folder pe tap karo
2. **"Sham-e-Shabistan-e-Raza"** book pe tap karo
3. Book reader open ho jayega
4. Left/Right arrows se pages navigate karo
5. Search icon pe tap karke page number enter karo

### 2. Text Search

1. Home screen par **search bar** pe tap karo
2. Urdu word type karo
3. Results mein page number aur context dikhega
4. Result pe tap karo → us page pe chale jao

---

## Naye Books Kaise Add Karen

1. Book images add karo:
   ```
   assets/books/[book-name]/
   ├── page1.jpg
   ├── page2.jpg
   └── ...
   ```

2. Text search index update karo:
   ```bash
   npm run generate-search-index
   ```

---

## Book Information

### Sham-e-Shabistan-e-Raza
- **Total Pages:** 896
- **Language:** Urdu
- **Format:** Page images (JPG)
- **Search:** Full text search available

---

## Credits

- **Islamic Content:** Sham-e-Shabistan-e-Raza
- **Framework:** React Native / Expo
- **Icons:** Ionicons

---

**Note:** Ye app educational aur religious purposes ke liye hai. All content respectfully presented hai readers ke benefit ke liye.
