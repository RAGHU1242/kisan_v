# AgriGo - Farm Equipment Rental Platform

A comprehensive full-stack application connecting farmers with agricultural equipment owners, featuring AI-powered recommendations, real-time chat, and interactive maps.

## 🚀 Features

### For Farmers
- 🤖 **AI-Powered Recommendations** - Get smart equipment suggestions based on crop type, farm stage, and requirements
- 📍 **Interactive Map View** - Find equipment near your location with Leaflet maps
- 📅 **Easy Booking System** - Book equipment with date selection and instant pricing
- 💬 **Real-time Chat** - Communicate directly with equipment owners
- 📊 **Booking Management** - Track all your bookings in one place

### For Resource Owners
- ➕ **List Equipment** - Add your agricultural machinery with details and pricing
- 📋 **Booking Management** - Accept/decline booking requests and manage availability
- 💰 **Earn Income** - Monetize idle equipment
- 💬 **Direct Communication** - Chat with farmers about rentals
- 📈 **Dashboard Analytics** - Track your listings and bookings

### For Administrators
- ✅ **Verify Listings** - Approve/reject equipment listings to ensure quality
- 👥 **User Management** - Monitor all platform users
- 📊 **System Analytics** - View platform statistics and metrics
- 🔍 **Quality Control** - Ensure platform integrity

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Beautiful component library
- **Leaflet & React-Leaflet** - Interactive maps
- **Firebase Auth** - Authentication system
- **Axios** - HTTP client

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase (Turso)** - SQLite database
- **Drizzle ORM** - Type-safe database queries

### ML API
- **Python Flask** - Lightweight API framework
- **NumPy** - Numerical computing
- **Flask-CORS** - Cross-origin support

### Real-time Features
- **Polling-based Chat** - Real-time messaging system

## 📁 Project Structure

```
agrigo/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── users/        # User management
│   │   │   ├── resources/    # Equipment listings
│   │   │   ├── bookings/     # Booking system
│   │   │   ├── chat/         # Chat messages
│   │   │   └── ml/           # ML predictions
│   │   ├── dashboard/        # Role-specific dashboards
│   │   │   ├── farmer/
│   │   │   ├── owner/
│   │   │   └── admin/
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration with role selector
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # Shadcn UI components
│   │   ├── MapView.tsx       # Leaflet map component
│   │   ├── ChatDialog.tsx    # Real-time chat
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Firebase auth context
│   ├── db/
│   │   ├── schema.ts         # Database schema
│   │   ├── index.ts          # Database connection
│   │   └── seeds/            # Seed data
│   └── lib/
│       └── firebase.ts       # Firebase config
├── ml_api/
│   ├── app.py                # Flask ML API
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # ML API docs
└── public/                   # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/bun
- Python 3.9+ (optional, for ML API)
- Firebase project
- Supabase/Turso account (already configured)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install
# or
bun install

# Optional: Install Python ML API dependencies
cd ml_api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Variables

Create a `.env` file in the root directory with your Firebase credentials:

```env
# Database (already configured)
TURSO_CONNECTION_URL=libsql://db-f87cfb71-7f83-4aef-8076-01e20188005b-orchids.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# Firebase Authentication (YOU NEED TO ADD THESE)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Database Setup

✅ **Database is already set up!** The database includes:
- 13 users (3 admins, 5 farmers, 5 owners)
- 15 agricultural equipment listings
- 10 sample bookings
- 20 chat messages

### 4. Run the Application

```bash
# Terminal 1: Run Next.js frontend
npm run dev
# or
bun dev

# Terminal 2 (Optional): Run Python ML API
cd ml_api
python app.py
```

Access the application:
- **Frontend:** http://localhost:3000
- **ML API:** http://localhost:5000 (optional)

## 👤 Test Accounts

You can create new accounts through the registration page, or use the seeded data:

### Sample Users (Create accounts with these emails)
- **Farmers:** farmer1@agrigo.com, farmer2@agrigo.com
- **Owners:** owner1@agrigo.com, owner2@agrigo.com  
- **Admins:** admin1@agrigo.com, admin2@agrigo.com

*Note: You'll need to create Firebase accounts for testing.*

## 📊 Database Schema

### Users
- id, email, name, role, firebaseUid, phone, createdAt

### Resources
- id, ownerId, name, type, description, pricePerDay, capacity, location, latitude, longitude, imageUrl, status, verifiedBy, createdAt

### Bookings
- id, farmerId, resourceId, ownerId, startDate, endDate, totalPrice, status, cropType, farmStage, cropWeight, createdAt

### Chat Messages
- id, bookingId, senderId, message, createdAt

## 🎯 User Flows

### Farmer Journey
1. Register as farmer
2. Complete crop/stage/weight form
3. Get AI recommendations
4. View equipment on map
5. Book equipment with dates
6. Chat with owner
7. Track booking status

### Owner Journey
1. Register as owner
2. List equipment (pending approval)
3. Manage booking requests
4. Accept/decline bookings
5. Chat with farmers
6. Mark bookings complete

### Admin Journey
1. Login as admin
2. View pending listings
3. Approve/reject equipment
4. Monitor users and bookings
5. View platform analytics

## 🔧 API Endpoints

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user

### Resources
- `GET /api/resources` - List equipment
- `POST /api/resources` - Add equipment
- `PUT /api/resources/[id]` - Update/verify equipment
- `DELETE /api/resources/[id]` - Delete equipment

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/[id]` - Update booking status

### Chat
- `GET /api/chat/[bookingId]` - Get messages
- `POST /api/chat` - Send message

### ML Predictions
- `POST /api/ml/predict` - Get equipment recommendations

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### ML API (Railway/Render)
```bash
# Procfile for deployment
web: gunicorn -w 4 -b 0.0.0.0:$PORT ml_api.app:app
```

## 🔮 Future Enhancements

- [ ] Real WebSocket implementation for chat
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Advanced ML model training
- [ ] Mobile app (React Native)
- [ ] Equipment availability calendar
- [ ] Review and rating system
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced analytics dashboard

## 📝 Development Timeline (5 Weeks)

### Week 1 ✅
- Firebase Auth integration
- Role-based signup (Farmer/Owner)
- Supabase database setup
- User management API

### Week 2 ✅
- Resource management system
- Owner dashboard with "Add Resource" form
- Admin dashboard with approval workflow
- Resource verification system

### Week 3 ✅
- Python Flask ML API
- Farmer dashboard with recommendation form
- ML-powered equipment suggestions
- Resource filtering and display

### Week 4 ✅
- Booking system implementation
- Real-time chat integration
- Leaflet map view
- Booking management for owners

### Week 5 ✅
- Polish all user flows
- Testing and bug fixes
- Documentation
- Deployment preparation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for beautiful UI components
- Firebase for authentication
- Supabase for database infrastructure
- Open source community

---

**AgriGo** - Transforming farm equipment rental, one booking at a time 🚜