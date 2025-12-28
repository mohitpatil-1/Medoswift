# MedoSwift (MERN)

Online medical consultation + medicine delivery platform with JWT auth + RBAC (User/Doctor/Admin), booking, pharmacy, prescription OCR, organizer subscription/reminders, orders + live tracking (Leaflet + OpenStreetMap).

## Tech
- **Client**: React + Vite + Tailwind + React Router + Framer Motion + Recharts + Leaflet
- **Server**: Node.js + Express + MongoDB (Mongoose) + Socket.IO + Zod validation

## Requirements
- Node.js 18+
- MongoDB (local or Atlas)

## 1) Setup

### A) Configure environment

**Server**: copy and edit:
```bash
cd server
cp .env.example .env
```

Key variables:
- `MONGO_URI` (required)
- `JWT_SECRET` (required)
- `PORT` (default 5000)

**Client**: (optional)
Create `client/.env` if you want a custom API URL:
```bash
VITE_API_URL=http://localhost:5000
```

### B) Install dependencies
From the project root:
```bash
npm install
npm run install:all
```

### C) Seed dummy data
```bash
npm run seed
```

### D) Run the app
```bash
npm start
```

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

## Demo Accounts
- **Admin**: `admin@medoswift.dev` / `Admin@123`
- **User**: `user@medoswift.dev` / `User@1234`
- **Doctor**: `aditi@medoswift.dev` / `Doctor@123`

## Notes
- **Maps**: Uses Leaflet + OpenStreetMap tiles (no API key required).
- **OCR**: Uses Tesseract.js for images and `pdf-parse` for PDF text extraction.
- **Payments**: Mock payment is implemented; Stripe can be integrated by extending the payment endpoint.

