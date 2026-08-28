# KrishiSarthi

**AI-powered agricultural decision-support platform** — built for Smart India Hackathon (Internal Round), Agriculture theme.

KrishiSarthi brings together four real, working AI/data-driven modules to help farmers make better decisions at every stage — from planting to selling.

## Live Demo

- Frontend: _[add your Vercel URL here after deployment]_
- Backend API docs: _[add your Render URL + /docs here]_

## Features

### Pest & Disease Prediction
Upload a photo of a crop leaf and get an instant AI diagnosis using a locally-run Vision Transformer model, trained on real crop disease data (wheat, rice, corn, and more). Returns top prediction with confidence score plus alternative possibilities.

### Input Optimization
Get fertilizer (N-P-K) recommendations based on crop type, growth stage, and soil type — scaled to your exact farm area. Combined with live 5-day weather forecasts to recommend whether to irrigate now, lightly, or skip it entirely.

### Mandi vs MSP Prices
Real-time mandi (market) prices pulled live from the Government of India's data.gov.in API, automatically compared against official MSP (Minimum Support Price) values — so farmers can instantly see if they're getting a fair price.

### Cold Storage Management
Calculates spoilage risk for harvested crops based on real post-harvest shelf-life data, days since harvest, and live ambient temperature — flags critical risk before produce goes to waste.

### Bilingual
Full English/Hindi toggle across every page, so the app is usable by farmers regardless of language preference.

### Real Authentication
Secure signup/login with hashed passwords (bcrypt) and JWT-based sessions. All activity is tied to your account and shown on a live dashboard.

## Tech Stack

**Frontend:** Next.js (React, TypeScript), Tailwind CSS
**Backend:** FastAPI (Python)
**Database:** SQLite (local) / PostgreSQL (production)
**ML:** Hugging Face Transformers (Vision Transformer for plant disease classification), PyTorch
**External APIs:** data.gov.in (mandi prices), Open-Meteo (weather — no API key required)
**Auth:** JWT + bcrypt password hashing

## Project Structure
KrishiSarthi/
├── api/ # FastAPI backend
│ ├── app/
│ │ ├── routers/ # API endpoints (auth, pest, prices, inputs, storage, activity)
│ │ ├── services/ # Business logic (ML inference, fertilizer/irrigation calc, etc.)
│ │ ├── models/ # Database models & Pydantic schemas
│ │ └── main.py # App entrypoint
│ └── requirements.txt
└── web/ # Next.js frontend
└── src/app/
├── pest/ # Pest prediction page
├── inputs/ # Input optimization page
├── prices/ # Mandi prices page
├── storage/ # Cold storage page
├── dashboard/ # User dashboard
└── login/ # Auth page


## Running Locally

**Backend:**
```bash
cd api
python -m venv venv
.\venv\Scripts\Activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`.

You'll also need a `.env` file inside `api/` with:

" DATA_GOV_API_KEY=your_key_from_data.gov.in "


## Author

Built by Vidya for Smart India Hackathon.

---

*Note: MSP figures are based on official government announcements for the 2025-26/2026-27 season and should be verified against the latest CACP announcements for production use.*
