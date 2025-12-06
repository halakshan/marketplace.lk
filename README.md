# marketplace.lk 🛒

> Sri Lanka's free classifieds platform — Buy and sell vehicles, property, electronics & more.

A full-stack classifieds web application built with **Next.js 14**, **Node.js**, and **Firebase**.

---

## 🌐 Features

- 📋 **Post free ads** — Vehicles, Property, Land, Electronics, Jobs, Services & more
- 🔍 **Browse & Search** — Filter by category, district, price range, condition
- 📞 **Contact sellers** — Reveal phone number or WhatsApp directly
- 🖼️ **Image uploads** — Up to 8 photos per ad via Cloudinary CDN
- 👤 **User accounts** — Register, login, manage your own ads
- ⭐ **Featured ads** — Highlighted listings on the homepage
- 🛡️ **Admin panel** — Manage categories and users

---

## 🧱 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Firebase Auth | Authentication |
| Axios | API requests |
| React Hook Form | Form management |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| Firebase Admin SDK | Firestore database |
| Cloudinary | Image storage & CDN |
| Multer | File upload handling |
| Helmet + CORS | Security |

---

## 📁 Project Structure

```
marketplace.lk/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── ads/               # Browse & ad detail
│   │   ├── post-ad/           # Post new ad wizard
│   │   ├── my-ads/            # Manage your ads
│   │   ├── profile/           # User profile
│   │   ├── notifications/     # Notifications
│   │   ├── (auth)/            # Login & Register
│   │   └── (admin)/           # Admin panel
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   └── shared/            # AdCard, LoadingSpinner
│   ├── context/               # AuthContext
│   ├── lib/                   # Firebase, Axios
│   └── types/                 # TypeScript interfaces
│
└── backend/                   # Express API
    └── src/
        ├── routes/            # ads, categories, users, upload, notifications
        ├── middleware/        # auth, errorHandler
        └── config/            # Firebase Admin SDK
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (Firestore + Auth)
- Cloudinary account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/halakshan/marketplace.lk.git
cd marketplace.lk
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your credentials in .env.local
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📱 Pages

| Route | Description |
|---|---|
| `/` | Homepage with featured & latest ads |
| `/ads` | Browse all ads with filters |
| `/ads/[id]` | Ad detail with contact info |
| `/post-ad` | 4-step ad posting wizard |
| `/my-ads` | Manage your posted ads |
| `/profile` | Edit your profile |
| `/login` | Login page |
| `/register` | Register page |
| `/admin/categories` | Admin — manage categories |
| `/admin/users` | Admin — manage users |

---

## 📦 Ad Categories

🚗 Vehicles · 🏠 Property · 🌳 Land · 📱 Electronics · 🛋️ Home & Garden · 💼 Jobs · 🔧 Services · 🐾 Animals & Pets · 👗 Fashion · ⚽ Sports · 📦 Other

---

## 🔒 Security

- Firebase ID token verification on all protected routes
- Role-based access control (user / admin)
- Helmet.js security headers
- Rate limiting on API endpoints
- Images stored securely on Cloudinary CDN

---

## 👨‍💻 Author

**halakshan** — [github.com/halakshan](https://github.com/halakshan)

---

## 📄 License

This project is for educational purposes.