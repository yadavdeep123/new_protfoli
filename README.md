# MERN Portfolio Website

This project is a complete MERN portfolio starter:

- React + Vite frontend
- Node.js + Express API backend
- MongoDB integration with a safe fallback data mode

## Project Structure

```
.
|- client
|  |- src
|  |- index.html
|  |- package.json
|- server
|  |- config
|  |- controllers
|  |- data
|  |- models
|  |- routes
|  |- package.json
|- package.json
```

## 1) Install Dependencies

From project root:

```bash
npm install
npm run install:all
```

## 2) Configure Environment

Backend:

1. Copy `server/.env.example` to `server/.env`
2. Set Mongo values:
   - `MONGO_URI`
   - `MONGO_DB_NAME`
   - `MONGO_DB_PASSWORD` (required when `MONGO_URI` contains `<db_password>`)

Frontend:

1. Copy `client/.env.example` to `client/.env`
2. Keep `VITE_API_URL=http://localhost:5001` unless your API runs elsewhere

## 3) Run Development Servers

From project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## API Endpoints

- `GET /api/health`
- `GET /api/portfolio`
- `PUT /api/portfolio`
- `POST /api/messages`

If MongoDB is unavailable, `GET /api/portfolio` still returns default portfolio data.

## Update Portfolio Data

1. Edit the profile content in `server/data/defaultPortfolio.js`.
2. Configure MongoDB in `server/.env` (`MONGO_URI=...`, `MONGO_DB_NAME=...`, and `MONGO_DB_PASSWORD=...` if needed).
3. Seed your portfolio data into MongoDB:

```bash
npm run seed --prefix server
```

4. Start the app and verify your data:

```bash
npm run dev
```

The frontend reads social links from API data (`social.github`, `social.linkedin`).

Photo update options:

1. Replace `client/public/profile-photo.svg` with your own image file (example: `profile-photo.jpg`).
2. Update `profileImage` in `server/data/defaultPortfolio.js` (example: `/profile-photo.jpg`).
3. Run seed again to push changes to MongoDB:

```bash
npm run seed --prefix server
```

## Email Notification Setup (Contact Form)

`POST /api/messages` can also send email notification using SMTP.

1. Open `server/.env` and add SMTP values:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `MAIL_FROM`
   - `MAIL_TO`
2. Restart backend server.
3. Submit contact form from frontend.

If SMTP is missing, message submission still works and API skips email notification safely.

## SMS Notification Setup (Mobile Number)

To receive each contact message on your mobile number, configure Twilio SMS:

1. Create/Sign in to Twilio account.
2. Buy/verify a Twilio phone number.
3. Add these values in `server/.env` (and production env):
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (Twilio sender number, E.164 format)
   - `SMS_TO` (your mobile number, E.164 format, example `+918709583627`)
4. Restart backend / redeploy server.

If Twilio config is missing, message submission still succeeds and SMS step is skipped.

## Deploy After MongoDB Setup (Render)

This project includes `render.yaml` for one-click infrastructure.

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select your repository.
3. Set backend environment variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `MONGO_DB_NAME` = your database name (example: `portfolio_db`)
   - `MONGO_DB_PASSWORD` = optional if your `MONGO_URI` uses `<db_password>` placeholder
   - `CLIENT_URL` = your frontend Render URL (for CORS)
4. Set frontend environment variable:
   - `VITE_API_URL` = your backend Render URL
5. Trigger deploy.
6. After first deploy, run database seed once:

```bash
npm run seed --prefix server
```

Your production stack will run as:

- API service (`server`) on Render Web Service
- Frontend (`client`) on Render Static Site
