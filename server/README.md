# ⚙️ Shorten URL (Backend)

This is the **backend API** for the Shorten URL app, built with **Node.js, Express, and MongoDB**.  
It provides secure **JWT authentication**, manages **access & refresh tokens**, and handles **URL creation, redirection, and analytics**.

---

## 🚀 Features
- 🔐 **User Authentication** (Signup & Login with JWT + Refresh Tokens)
- 🔗 **URL Shortening API** (Generate short URLs)
- 📊 **Analytics Tracking** (Click count, creation date)
- 🗑️ **Delete Links** when not needed
- 💾 **MongoDB Atlas Integration**
- ⚡ **Secure Token Management**
- 🌍 **Deployed on [Render](https://render.com)**

---

## 📂 Project Structure

1. `config/` → **Database & environment setup**  
2. `controllers/` → **Auth & URL logic**  
3. `middleware/` → **Auth verification (JWT)**  
4. `models/` → **MongoDB schemas (User & URL)**  
5. `routes/` → **API routes (auth & url)**  
6. `server.js` → **Entry point**  
7. `package.json` → **Dependencies & scripts**  
8. `README.md` → **Backend documentation**

---

## 🛠️ Installation (Local Development)

```bash
# Clone the repo
git clone https://github.com/Chiragmanral/SHORTEN-URL
cd SHORTEN-URL/server

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the server/ folder with the following:

PORT=8000
MONGO_URL=your_mongodb_atlas_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
BASE_URL=http://localhost:8000

# Start the server
npm start
# or
nodemon server.js   # (Recommended for development with hot reload)

# Your backend will now run on http://localhost:8000

```

---

## API Endpoints

- API -> `https://api.chirag.engineer`

🔑 Auth

1. POST `API/auth/signup` → Register user
2. POST `API/auth/login` → Login & get tokens
3. POST `API/auth/refreshAccessToken` → Refresh access token
4. POST `API/auth/logout` -> Logs out the user
5. POST `API/auth/isTokensValid` -> Checks the validity of both access and refresh tokens.

📝 Notes

1. GET `API/shortUrls` → Get all URLs for the logged-in user
2. POST `API/short` → Shorten a long URL
3. GET `API/:shortId` → Redirect to the original URL
4. GET `API/analytics/:shortId` → Get analytics for a specific URL
5. POST `API/deleteShortUrl` → Delete a shortened URL

---

## 📜 License
This project is licensed under the MIT License.



