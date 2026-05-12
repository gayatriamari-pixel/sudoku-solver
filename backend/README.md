# Sudoku Solver — Backend API

Node.js + Express + MongoDB backend for the Sudoku Solver leaderboard.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: MongoDB Atlas (via Mongoose)
- **Validation**: express-validator
- **Rate limiting**: express-rate-limit
- **CORS**: cors

---

## API Endpoints

### `GET /api/leaderboard`
Returns leaderboard entries sorted by solve time (fastest first).

**Query parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `difficulty` | `easy\|medium\|hard` | *(all)* | Filter by difficulty |
| `limit` | integer 1–100 | `20` | Max records returned |

**Success response `200`:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "rank": 1,
      "_id": "...",
      "playerName": "Alice",
      "difficulty": "hard",
      "solveTime": 142,
      "solvedByAI": false,
      "createdAt": "2024-06-01T10:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/leaderboard`
Saves a new score entry.

**Request body:**
```json
{
  "playerName": "Alice",
  "difficulty": "hard",
  "solveTime": 142,
  "solvedByAI": false
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `playerName` | string | ✅ | 1–30 chars |
| `difficulty` | string | ✅ | `easy`, `medium`, or `hard` |
| `solveTime` | integer | ✅ | 1–86400 seconds |
| `solvedByAI` | boolean | ❌ | default `false` |

**Success response `201`:**
```json
{
  "success": true,
  "message": "Score saved!",
  "data": {
    "id": "...",
    "playerName": "Alice",
    "difficulty": "hard",
    "solveTime": 142,
    "solvedByAI": false,
    "createdAt": "2024-06-01T10:00:00.000Z",
    "rank": 3
  }
}
```

**Error response `400`:**
```json
{ "success": false, "message": "difficulty must be easy, medium, or hard" }
```

---

### `GET /health`
Health check endpoint.

```json
{ "success": true, "status": "OK", "timestamp": "2024-06-01T10:00:00.000Z" }
```

---

## Local Development

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your MONGODB_URI
```

### 3. Run dev server
```bash
npm run dev        # uses nodemon, hot-reload
# or
npm start          # plain node
```

Server starts on `http://localhost:4000`

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. **Database Access** → Add user with password
3. **Network Access** → Add `0.0.0.0/0` (allow all IPs, required for Render)
4. **Connect** → Drivers → copy the connection string
5. Paste it into `.env` as `MONGODB_URI`, replacing `<password>` and `<dbname>`

---

## Deploy to Render

1. Push the `backend/` folder to a GitHub repo (or the whole project)
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your repo; set **Root Directory** to `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Environment Variables** (in Render dashboard):
   ```
   MONGODB_URI      = <your Atlas URI>
   NODE_ENV         = production
   ALLOWED_ORIGIN   = https://your-app.vercel.app
   PORT             = (leave blank — Render sets this)
   ```
7. Deploy → copy the `https://your-service.onrender.com` URL

---

## Deploy Frontend to Vercel

1. Push the `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import repo
3. Set **Root Directory** to `frontend`
4. **No build command needed** (static HTML)
5. Before deploying, edit `frontend/index.html`:
   - Find the line: `return 'https://your-sudoku-backend.onrender.com';`
   - Replace with your actual Render URL
6. Deploy → your app is live!

---

## Project Structure

```
backend/
├── server.js              # Express app entry point
├── package.json
├── .env.example           # Copy to .env and fill in values
├── .gitignore
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── leaderboardController.js   # GET + POST handlers
├── middleware/
│   └── errorHandler.js    # Global error handler
├── models/
│   └── Score.js           # Mongoose schema + indexes
├── routes/
│   └── leaderboard.js     # Route definitions + validation
└── README.md
```
