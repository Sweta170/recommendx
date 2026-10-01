# 🚀 RecommendX - Distributed Product Recommendation Engine

RecommendX is a high-throughput, distributed product recommendation backend powered by **Node.js**, **Express**, **Neon PostgreSQL (Cloud)**, and **Redis Cloud**.

---

## 📁 Project Architecture

```
recommendx/
├── src/
│   ├── config/
│   │   ├── database.js     # Neon Cloud PostgreSQL connection pool with SSL
│   │   ├── redis.js        # Redis Cloud client with TLS & retry backoff
│   │   └── constants.js    # System constants, HTTP status codes, cache keys
│   ├── middleware/
│   │   ├── auth.js         # JWT verification & Role-Based Access Control (RBAC)
│   │   ├── errorHandler.js # Global error handler & PG error code mapper
│   │   ├── validation.js   # Joi schema request validation middleware
│   │   └── logger.js       # Morgan HTTP request logging middleware
│   ├── utils/
│   │   ├── cache.js        # Cache-aside utility, TTL management, key invalidation
│   │   ├── database.js     # Auto schema initialisation on startup
│   │   ├── validators.js   # Joi validation schemas (Auth, Products, Interactions, Recs)
│   │   └── helpers.js      # Standard JSON response formatters & math helpers
│   ├── routes/
│   │   └── index.js        # API route aggregation, /products, & health check endpoints
│   └── server.js           # Express app bootstrap, rate limiting & graceful shutdown
├── database/
│   ├── schema.sql          # Cloud PostgreSQL schema (users, products, user_behavior, recommendations)
│   └── init.sql            # Verification queries
├── .env                    # Cloud credentials & environment configuration
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Cloud Database**: Neon PostgreSQL (Serverless, SSL-enabled)
- **Cloud Cache & Broker**: Redis Cloud (In-Memory, TLS-enabled)
- **Security & Validation**: Helmet, CORS, Joi, JSON Web Tokens (JWT), Express Rate Limit
- **Logging**: Morgan

---

## ⚙️ Quick Start & Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Cloud Credentials
Update your `.env` file with your **Neon.tech** and **Redis Cloud** credentials:
```env
# ===== CLOUD DATABASE (Neon PostgreSQL) =====
DB_HOST=ep-your-instance.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USER=neon_user
DB_PASSWORD=your_neon_password
DB_NAME=recommendx
DB_SSL=true

# ===== CLOUD REDIS (Redis Cloud) =====
REDIS_HOST=redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=16379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=true

# ===== API CONFIG =====
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

### 3. Run the Application
The app will connect to your cloud services and **automatically create & seed tables on startup**:

```bash
# Development mode (with nodemon):
npm run dev

# Production mode:
npm start
```

---

## 🔍 Verification & Health Checks

- **System Health**: `GET http://localhost:3000/api/health`
- **Seeded Products**: `GET http://localhost:3000/api/products`
- **Root Status**: `GET http://localhost:3000/`
