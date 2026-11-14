# AgroGuide AI - API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require the HTTP header:
```http
Authorization: Bearer <supabase_access_token>
```

---

## 1. System Health
### `GET /health`
Returns backend service health and uptime status.

### `GET /health/ready`
Verifies environment readiness (Supabase, Gemini, Weather credentials).

---

## 2. Authentication & Profile
### `GET /auth/me`
Retrieves authenticated farmer user profile.

### `GET /profile`
Retrieves the farmer profile.

### `PUT /profile`
Updates farmer profile metadata (name, phone, state, district, village, preferred language).

---

## 3. Farm Plots Management
### `GET /farms`
List all farms owned by the authenticated user.

### `POST /farms`
Create a new farm plot.
```json
{
  "farm_name": "Plot 1",
  "location": "Near River Canal",
  "state": "Karnataka",
  "district": "Dharwad",
  "village": "Navalgund",
  "land_area": 3.5,
  "land_unit": "acre",
  "soil_type": "Black soil",
  "water_availability": "Irrigation available",
  "farming_method": "IPM"
}
```

### `GET /farms/:id`
Retrieve details of a single farm plot.

### `PUT /farms/:id`
Update an existing farm plot.

### `DELETE /farms/:id`
Delete a farm plot.

---

## 4. Agricultural Advisory Endpoints

### `POST /advisory/crop-recommendation`
Generates top 5 suitable crops based on soil, climate, and season.
```json
{
  "location": "Navalgund",
  "state": "Karnataka",
  "district": "Dharwad",
  "soil_type": "Black soil",
  "soil_ph": 6.8,
  "nitrogen": 280,
  "phosphorus": 24,
  "potassium": 310,
  "temperature": 28,
  "humidity": 65,
  "rainfall": 120,
  "water_availability": "Irrigation available",
  "land_area": 3.5,
  "land_unit": "acre",
  "growing_season": "Kharif",
  "language": "en"
}
```

### `POST /advisory/soil-analysis`
Evaluates soil pH, macro-nutrients, and organic amendments.

### `POST /advisory/fertilizer`
Computes growth-stage fertilizer timing and biofertilizer alternatives.

### `POST /advisory/irrigation`
Generates smart watering schedules, timings, and water conservation methods.

### `POST /advisory/disease-detection`
**Content-Type:** `multipart/form-data`
- `image`: Image file (JPG, PNG, WEBP, up to 5 MB)
- `crop_name`: string (optional)
- `visible_symptoms`: string (optional)
- `language`: string ('en', 'hi', 'kn', 'te', 'ta', 'ml')

---

## 5. Weather Intelligence
### `GET /weather/current?location=Dharwad&state=Karnataka`
Returns current weather observations and immediate farming operation insights (sowing, spraying, irrigation, fertilizer safety).

### `GET /weather/forecast?location=Dharwad&state=Karnataka`
Returns 5-day daily agricultural weather forecast.

---

## 6. AI Agricultural Chatbot
### `POST /chat`
Sends a question to the context-aware agricultural assistant.
```json
{
  "conversation_id": "optional-uuid",
  "message": "What is the best time to apply Neem oil spray on Cotton?",
  "language": "en"
}
```

### `GET /chat/conversations`
List previous conversations.

### `GET /chat/conversations/:id`
Retrieve conversation messages.

### `DELETE /chat/conversations/:id`
Delete conversation and message thread.

---

## 7. History & Dashboard Analytics
### `GET /history?type=crop&page=1&limit=10`
Paginated advisory records.

### `GET /history/:id`
Full advisory document details.

### `DELETE /history/:id`
Delete an advisory record.

### `GET /dashboard/stats`
Computes real counts and recent activities directly from user-owned database records.
