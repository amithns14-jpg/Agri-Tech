# 🌾 AgroGuide AI: AI-Powered Agriculture Crop Advisory Assistant

> A production-grade, full-stack agricultural intelligence platform empowering Indian farmers with scientifically calibrated AI crop selection, soil health analysis, stage-specific fertilizer guidance, smart irrigation scheduling, visual disease diagnosis, and a multilingual chatbot powered by Google Gemini and Supabase.

---

## 🌟 Key Features

### 1. 🌾 AI-Based Crop Recommendation (Top 5 Suitable Crops)
- Analyzes soil type, pH (0-14), Nitrogen, Phosphorus, Potassium, temperature, humidity, rainfall, water availability, and growing season (Kharif, Rabi, Zaid).
- Generates qualitative suitability scores (0-100), duration in days, sowing windows, and essential precautions.
- Employs strict uncertainty guardrails (never promises guaranteed financial or yield returns).

### 2. 🧪 Soil Health & Nutrient Analysis
- Diagnoses soil pH condition (Acidic, Neutral, Alkaline).
- Identifies macro-nutrient imbalances (N, P, K) with organic carbon and moisture context.
- Recommends tailored amendments (farmyard manure, vermicompost, liming, gypsum, biofertilizers).

### 3. 🌿 Stage-Specific Fertilizer Advisory
- Aligns nutrient needs with the crop's vegetative, flowering, or pod development stages.
- Recommends balanced fertilizer options (Neem-coated urea, DAP, MOP) and biofertilizers (Azotobacter, PSB).
- Incorporates environmental precautions against surface runoff and leaching.

### 4. 💧 Smart Weather-Aware Irrigation
- Computes watering intervals and optimal application timing (morning/evening) based on soil water retention.
- Recommends conservation techniques (mulching, drip) and alerts against overwatering fungal hazards.

### 5. 🔬 Multi-Modal Crop Disease Identification
- Allows farmers to upload or capture photos of infected plant leaves (JPG, PNG, WEBP, up to 5 MB).
- Validates file signatures and leverages Gemini Vision to diagnose visible pathology, estimate severity (Mild to Critical), and suggest immediate containment actions.

### 6. 🤖 Multilingual Agricultural Chatbot
- Context-aware conversational assistant responding in **6 Indian languages**: English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்), and Malayalam (മലയാളം).
- Focuses strictly on agronomic challenges and redirects non-farming inquiries.

### 7. 🚜 Farm & Land Profile Management
- Multi-plot management for farmers (location, land area, units, dominant soil type, water source).
- Seamless auto-fill across all advisory forms.

### 8. 📊 Live Dashboard & Advisory History
- Real-time statistics computed strictly from user-owned database records.
- Filterable and paginated archive of all past crop, soil, and disease advisories with delete capabilities.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend:** Node.js, Express.js (REST API prefix `/api/v1`), TypeScript, Zod validation, Express Rate Limiter, Multer.
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth, Supabase Storage (`crop-images` bucket), and comprehensive Row Level Security (RLS) policies.
- **AI Engine:** Official Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash`.
- **Weather Adapter:** Weather API client with regional agro-climatic fallbacks.

---

## 📁 Repository Structure

```text
agroguide-ai/
├── client/                     # React 18 + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI & Layout Components
│   │   ├── context/            # AuthContext & LanguageContext (i18n)
│   │   ├── lib/                # Supabase Client & i18n Dictionary
│   │   ├── pages/              # All 17 Application Pages / Routes
│   │   ├── services/           # Axios API Client
│   │   ├── App.tsx             # Route Configuration
│   │   └── main.tsx            # Entry Point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment Loader & Zod Validation
│   │   ├── middleware/         # Auth (Supabase JWT) & Central Error Middleware
│   │   ├── routes/             # REST API Routes (/api/v1)
│   │   ├── services/           # Gemini, Crop, Soil, Fertilizer, Disease, Weather
│   │   ├── utils/              # Supabase Client & Fallback Store
│   │   ├── validators/         # Zod Input Schemas
│   │   ├── app.ts              # Express App Setup
│   │   └── server.ts           # Server Entry Point
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   ├── migrations/             # Production SQL Migration (11 tables + RLS)
│   ├── seed.sql                # Seed Data for Testing
│   └── config.toml             # Local Supabase CLI configuration
│
├── docs/                       # Architecture, API, and Deployment Documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   └── deployment-guide.md
│
├── .env.example                # Template for Environment Configuration
├── package.json                # Monorepo Orchestration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have Node.js (v20+) and `pnpm` installed:
```bash
npm install -g pnpm
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Add your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
*(Note: If API keys are not immediately configured, AgroGuide AI seamlessly activates its resilient local fallback mode with pre-calibrated agro-climatic intelligence, allowing complete UI and functional testing out-of-the-box!)*

### 4. Run Database Migration in Supabase
Run the SQL script from `supabase/migrations/20260213000001_initial_schema.sql` in your Supabase SQL editor.

### 5. Launch Development Servers
To run both client and server concurrently:
```bash
pnpm dev
```
Or separately:
```bash
# Terminal 1 - Backend Server (Port 5000)
pnpm dev:server

# Terminal 2 - Frontend Client (Port 5173)
pnpm dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Data Isolation
- **Row Level Security:** Users can only query, modify, or delete their own farm records, recommendations, and images.
- **Magic-Byte Signature Verification:** Uploaded crop images are checked for valid binary signatures (PNG, JPEG, WEBP) to prevent malicious executable injection.
- **Server-Side API Key Storage:** Neither the Gemini API key nor the Supabase service role key is ever exposed to the client browser.
- **Rate Limiting:** Prevents API abuse and token exhaustion.

---

## 📄 License
This project is licensed under the MIT License.
