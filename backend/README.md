# Ankese Birhan Senbet - Backend API

Backend server for the Ankese Birhan Senbet Sunday School management system.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (if you don't have one)
3. Create a new cluster
4. Click "Connect" and choose "Connect your application"
5. Copy your connection string

### 3. Update Environment Variables

Open the `.env` file and replace the placeholder with your actual MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/ankese_birhan_senbet?retryWrites=true&w=majority
```

**Important:** Replace:
- `your_username` with your MongoDB username
- `your_password` with your MongoDB password
- `cluster0.xxxxx` with your actual cluster address

### 4. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## Folder Structure

```
backend/
├── config/          # Configuration files
│   └── db.js       # MongoDB connection
├── models/         # Database schemas (Mongoose models)
├── routes/         # API routes
├── controllers/    # Business logic
├── .env           # Environment variables
├── .gitignore     # Git ignore file
├── server.js      # Main server file
└── package.json   # Dependencies
```

## API Endpoints

- `GET /` - Welcome message and server status

## Next Steps

1. Create Mongoose models for your data (students, teachers, classes, etc.)
2. Create API routes for CRUD operations
3. Add authentication and authorization
4. Connect frontend to backend API
