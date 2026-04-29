# GitHub پر Upload کرنے سے پہلے

## ⚠️ اہم نوٹ

GitHub پر code upload کرتے وقت یہ فائلیں **upload نہیں ہوں گی** (`.gitignore` میں ہیں):

### 1. **node_modules/** 
- بہت بڑی فائلیں (سیکڑوں MB)
- GitHub پر upload نہ کریں
- دوسرے کمپیوٹر پر `npm install` سے دوبارہ بنائیں

### 2. **embeddings.db**
- SQLite ڈیٹا بیس (~5 MB)
- صارف کے کمپیوٹر پر بنتا ہے
- GitHub پر upload نہ کریں

### 3. **images/** فولڈر
- 896 تصویریں (~500 MB)
- بہت بڑا ہے
- GitHub پر upload نہ کریں

### 4. **.env** فائلیں
- حساس معلومات (API keys وغیرہ)
- GitHub پر upload نہ کریں

---

## ✅ GitHub پر Upload کرنے کے لیے

### **مرحلہ 1: Repository بنائیں**
```bash
git init
git add .
git commit -m "Initial commit: Islamic Books App with Image Search"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/islamic-books-app.git
git push -u origin main
```

### **مرحلہ 2: دوسرے کمپیوٹر پر Clone کریں**
```bash
git clone https://github.com/YOUR_USERNAME/islamic-books-app.git
cd islamic-books-app
```

### **مرحلہ 3: Dependencies انسٹال کریں**
```bash
# IslamicBooksApp کے لیے
cd IslamicBooksApp
npm install

# image-search-server کے لیے
cd ../image-search-server
npm install
```

### **مرحلہ 4: Embeddings بنائیں**
```bash
# تصویریں کاپی کریں
mkdir images
# اپنی تصویریں یہاں کاپی کریں

# سرور شروع کریں
node server.js

# دوسری ٹرمینل میں
curl -X POST http://localhost:3000/api/precompute
```

---

## 📋 .gitignore میں کیا ہے

### **روٹ .gitignore**
```
node_modules/          # سب node_modules فولڈرز
*.db                   # تمام ڈیٹا بیس فائلیں
*.jpg, *.png, etc      # بڑی تصویریں
.env                   # حساس معلومات
```

### **image-search-server/.gitignore**
```
node_modules/          # سرور کے dependencies
embeddings.db          # ڈیٹا بیس
images/                # 896 تصویریں
```

### **IslamicBooksApp/.gitignore**
```
node_modules/          # ایپ کے dependencies
.expo/                 # Expo کی فائلیں
```

---

## 🚀 GitHub پر کیا Upload ہوگا

✅ **یہ فائلیں upload ہوں گی:**
- `App.js` - مرکزی ایپ
- `components/` - تمام کمپوننٹس
- `utils/` - تمام utilities
- `package.json` - dependencies کی فہرست
- `server.js` - سرور کا کوڈ
- `README.md` - دستاویز

❌ **یہ فائلیں upload نہیں ہوں گی:**
- `node_modules/` - بہت بڑا
- `embeddings.db` - ڈیٹا بیس
- `images/` - تصویریں
- `.env` - حساس معلومات

---

## 📝 GitHub README

GitHub پر یہ README دکھائی دے گی:

```markdown
# Islamic Books App 📚

اسلامی کتابوں کو پڑھنے اور تلاش کرنے کے لیے React Native ایپ۔

## خصوصیات
- متن کی بنیاد پر تلاش
- تصویر کی بنیاد پر تلاش
- آف لائن سپورٹ
- Vector Embeddings

## سیٹ اپ
1. `npm install` چلائیں
2. `npm start` سے ایپ شروع کریں
3. سرور کے لیے `node server.js` چلائیں

## مزید معلومات
`IslamicBooksApp/README.md` دیکھیں
```

---

## ⚡ تیز رفتار سیٹ اپ

اگر کوئی آپ کا code clone کرے تو:

```bash
# 1. Clone کریں
git clone <repo-url>
cd islamic-books-app

# 2. Dependencies انسٹال کریں
cd IslamicBooksApp && npm install
cd ../image-search-server && npm install

# 3. سرور شروع کریں
cd image-search-server
node server.js

# 4. ایپ شروع کریں (دوسری ٹرمینل میں)
cd IslamicBooksApp
npm start
```

---

## 🔒 حساس معلومات

اگر کوئی API keys یا passwords ہوں تو:

1. `.env` فائل بنائیں
2. `.gitignore` میں `.env` شامل کریں
3. `.env.example` بنائیں (بغیر values کے)

**مثال:**
```
# .env (upload نہ کریں)
API_KEY=secret123

# .env.example (upload کریں)
API_KEY=your_key_here
```

---

## ✨ خلاصہ

| فائل | Upload | وجہ |
|------|--------|-----|
| `App.js` | ✅ | کوڈ ہے |
| `node_modules/` | ❌ | بہت بڑا |
| `embeddings.db` | ❌ | ڈیٹا بیس |
| `images/` | ❌ | تصویریں |
| `package.json` | ✅ | Dependencies کی فہرست |
| `.env` | ❌ | حساس معلومات |

---

*یہ سیٹ اپ GitHub پر code upload کرنے کے لیے تیار ہے!* 🚀
