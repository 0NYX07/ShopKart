<div id="top"></div>

<div align="center">

# 🛍️ ShopKart - Full-Stack E-Commerce Application

**A Production-Style E-Commerce Platform Built Across Engineering Labs.**  
*Secure JWT Auth · Dynamic Catalog Search & Sorting · Persistent MongoDB Wishlist Governance*

<br />

[![Node.js](https://img.shields.io/badge/Node.js-v18+-050505.svg?style=for-the-badge&logo=node.js&logoColor=green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-050505.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-050505.svg?style=for-the-badge&logo=mongodb&logoColor=3ECF8E)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-v19-050505.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6.0-050505.svg?style=for-the-badge&logo=vite&logoColor=646CFF)](https://vitejs.dev/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT_HttpOnly-050505.svg?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-d4af37.svg?style=for-the-badge)](LICENSE)

<br />

> 🌐 **Full-Stack Application Overview**: Built progressively across **Labs 01 – 04** featuring **JWT Cookie Security**, **MongoDB Schema Referencing**, **Express REST APIs**, and **React 19 SPA**.

<br />

[About](#about-shopkart) · [Quick Start](#quick-start) · [Lab Progression](#-engineering-lab-progression--feature-matrix) · [Architecture Breakdown](#-file--directory-architecture-breakdown) · [API Specs](#-api-reference-documentation) · [Viva Q&A Guide](#-comprehensive-viva-examination-preparation-guide-60-questions)

</div>

---

<div align="center">
  <h2>About ShopKart</h2>
</div>

Modern e-commerce platforms require seamless integration between **secure user authentication**, **real-time product catalog search and filtering**, and **persistent user governance systems like Wishlists and Carts**.

**ShopKart** is a production-style full-stack e-commerce web application developed across four modular engineering labs using **Node.js, Express.js, MongoDB (Mongoose), and React (Vite)**. It strictly avoids superficial client-side shortcuts by implementing server-verified JWT authorization, relational Mongoose schema population, and robust UI feedback loops.

### 🌟 Foundational Principles

1. **Security-First Session Management**: Authentication credentials rely on cryptographically signed **JSON Web Tokens (JWT)** stored in unscriptable `HttpOnly` cookies, eliminating Cross-Site Scripting (XSS) token theft.
2. **Relational Database Integrity**: Wishlist and user relationships utilize **MongoDB `ObjectId` referencing** (`ref: 'Product'`) with server-side `.populate()` instead of fragile embedded snapshots.
3. **Dynamic Catalog Discovery**: Dynamic regex-based search, multi-category filtering, and price sorting (`price_asc`, `price_desc`) implemented directly at the database query layer.
4. **Reactive UI & State Resilience**: Built with React 19, controlled components, and explicit visual states for **Loading**, **Empty Data**, and **Network Error Handling**.
5. **IDOR & Injection Immunity**: Protected endpoints dynamically extract user identity from `req.user._id` set by authentication middleware, blocking Insecure Direct Object Reference (IDOR) exploits.

---

<div align="center">
  <h2>Quick Start</h2>
</div>

### Prerequisites

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local instance running on `mongodb://127.0.0.1:27017` (or auto-fallback to In-Memory MongoDB)

### Local Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/TheVicky1/ShopKart.git
cd ShopKart

# 2. Setup and launch Backend Server
cd backend
npm install
npm run dev

# 3. Setup and launch Frontend Client (in a new terminal)
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the ShopKart Frontend, and [http://localhost:5000](http://localhost:5000) for the Backend API.

---

<div align="center">
  <h2>Engineering Lab Progression</h2>
</div>

- **Lab 01 — Customer Auth Backend**: Modeled database schemas using **Mongoose**, implemented password hashing with **bcrypt**, generated **JWT tokens**, stored credentials securely using **`HttpOnly` cookies**, and built protected profile endpoints (`GET /customers/me`).
- **Lab 02 — Customer Auth Frontend**: Built a client-side Single Page Application (SPA) in **React (Vite)** with controlled components, client-side routing via **React Router DOM**, centralized API communication via **Axios**, and session persistence.
- **Lab 03 — Product Catalog & Discovery**: Developed full-stack product management capabilities with product creation, regex search, category filtering, price sorting (`price_asc`, `price_desc`), dynamic route product details (`/products/:id`), and user feedback states (**Loading**, **Error**, and **Empty** states).
- **Lab 04 — Wishlist Experience**: Implemented user-specific product wishlisting:
  - Extended `Customer` schema with MongoDB `ObjectId` array referencing `Product` (`ref: "Product"`).
  - Built protected REST APIs: `POST /wishlist/:productId` (with `409 Conflict` duplicate prevention), `GET /wishlist` (using Mongoose `.populate()`), and `DELETE /wishlist/:productId`.
  - Created a dynamic React Wishlist Page (`/wishlist`), Wishlist Card components, Navbar badge count, and UI states (**Loading**, **Empty** with `[ Browse Products ]`, and **Error** with `[ Try Again ]`).

---


## 📊 Engineering Lab Progression & Feature Matrix

| Feature / Module | Lab Introduced | Backend Route | Frontend Component / Page | Key Technologies Used |
| :--- | :---: | :--- | :--- | :--- |
| **Customer Registration** | Lab 01 & 02 | `POST /customers/register` | `Register.jsx` | Bcrypt hashing, Mongoose validation |
| **Customer Login & JWT** | Lab 01 & 02 | `POST /customers/login` | `Login.jsx` | JWT token, `HttpOnly` Cookies |
| **Protected Profile** | Lab 01 & 02 | `GET /customers/me` | `Home.jsx` | Express `protect` auth middleware |
| **Product Schema & Creation** | Lab 03 | `POST /products` | Backend Seeding / Postman | Mongoose validation (`min price`, `min stock`) |
| **Product Discovery & Search** | Lab 03 | `GET /products?search=&category=` | `Products.jsx`, `SearchBar.jsx` | MongoDB `$regex`, Dynamic Query Building |
| **Product Price Sorting** | Lab 03 Bonus | `GET /products?sort=price_asc` | `Products.jsx`, `SearchBar.jsx` | Mongoose `.sort({ price: 1 })` |
| **Product Details View** | Lab 03 | `GET /products/:id` | `ProductDetails.jsx` | React Router `useParams()` |
| **Wishlist ObjectId Schema** | Lab 04 | `customerSchema.wishlist` | `Customer.js` Model | `mongoose.Schema.Types.ObjectId`, `ref: 'Product'` |
| **Add to Wishlist** | Lab 04 | `POST /wishlist/:productId` | `ProductCard.jsx` | `409 Conflict` Duplicate check |
| **Get Populated Wishlist** | Lab 04 | `GET /wishlist` | `Wishlist.jsx`, `WishlistCard.jsx` | Mongoose `.populate('wishlist')` |
| **Remove from Wishlist** | Lab 04 | `DELETE /wishlist/:productId` | `WishlistCard.jsx`, `ProductCard.jsx` | MongoDB `$pull` / array filter |
| **Wishlist Navbar Badge** | Lab 04 Bonus | `GET /wishlist` | `Navbar.jsx` | Dynamic React props & backend fetch |

---

## 🛠 Tech Stack

### **Backend Stack**
* **Runtime**: Node.js (v18+)
* **Framework**: Express.js (`v5.2.1`)
* **Database**: MongoDB (Local instance or In-Memory fallback via `mongodb-memory-server`)
* **ODM Library**: Mongoose (`v9.9.4`)
* **Authentication & Security**: `jsonwebtoken`, `bcrypt`, `cookie-parser`, `cors`
* **Environment Configuration**: `dotenv`

### **Frontend Stack**
* **Framework**: React (`v19.2.8`) via Vite (`v8.2.2`)
* **Routing**: React Router DOM (`v7.18.3`)
* **HTTP Client**: Axios (`v1.20.0`) with `withCredentials: true`
* **Styling**: Modern Custom CSS (Flexbox, Grid, Glassmorphism, Micro-animations)

---

## 📁 File & Directory Architecture Breakdown

```text
ShopKart/
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── SearchBar.jsx
    │   │   └── WishlistCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── Products.jsx
    │   │   ├── Register.jsx
    │   │   └── Wishlist.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

### 1. Backend Directory (`backend/`)

| File / Folder Path | Type | Lab | Purpose & Architectural Overview |
| :--- | :---: | :---: | :--- |
| `index.js` | **File** | Labs 1-4 | **Express Server Entry Point**: Configures Express, CORS (`withCredentials: true`), body parsers, cookie parser, resilient MongoDB connection with In-Memory fallback, database seeding, and mounts API routes (`/customers`, `/products`, `/wishlist`). |
| `.env` | **File** | Lab 01 | **Environment Secret Config**: Stores database connection strings (`MONGO_URI`), server `PORT`, and JWT signing secret (`JWT_SECRET`). *(Git-ignored)* |
| `models/customer.model.js` | **File** | Labs 1 & 4 | **Customer Schema**: Defines fields for `fullName`, `email` (unique), `password`, `phone`, and `wishlist` array storing `mongoose.Schema.Types.ObjectId` references pointing to `Product`. |
| `models/product.model.js` | **File** | Lab 03 | **Product Schema**: Defines product data blueprint: `name`, `description`, `price` (`min: 0.01`), `category`, `image`, `stock` (`min: 0`), and automatic `createdAt` timestamp. |
| `controllers/customer.controller.js` | **File** | Labs 1 & 2 | **Customer Handlers**: `registerCustomer` (bcrypt hashing), `loginCustomer` (password comparison & JWT `HttpOnly` cookie setting), `getMyProfile` (authenticated customer data), and `logoutCustomer` (clears cookie). |
| `controllers/product.controller.js` | **File** | Lab 03 | **Product Handlers**: `createProduct` (validates price/stock), `getAllProducts` (case-insensitive `$regex` search, category match, price sorting `price_asc`/`price_desc`), and `getProductById` (validates ObjectId & fetches details). |
| `controllers/wishlist.controller.js` | **File** | Lab 04 | **Wishlist Handlers**: `addToWishlist` (validates ID, checks duplicate `409 Conflict`, pushes reference), `getWishlist` (uses `.populate()` to resolve full product objects), and `removeFromWishlist` (filters reference from user array). |
| `routes/customer.routes.js` | **File** | Labs 1 & 2 | **Customer Routes**: Maps `/register` (POST), `/login` (POST), `/me` (GET, protected), and `/logout` (POST, protected). |
| `routes/product.routes.js` | **File** | Lab 03 | **Product Routes**: Maps `/` (POST create, GET catalog list) and `/:id` (GET product details). |
| `routes/wishlist.routes.js` | **File** | Lab 04 | **Wishlist Routes**: Maps `POST /:productId`, `GET /`, and `DELETE /:productId` protected by `protect` authentication middleware. |
| `middlewares/auth.middleware.js` | **File** | Lab 02 | **JWT Protection Guard (`protect`)**: Extracts `req.cookies.token`, verifies JWT payload using `jwt.verify()`, attaches user object to `req.user`, or returns `401 Unauthorized`. |
| `utils/generateToken.js` | **File** | Lab 01 | **JWT Signing Utility**: Signs a JSON Web Token with customer ID and secret key, setting expiration to 1 day (`1d`). |

---

### 2. Frontend Directory (`frontend/`)

| File / Folder Path | Type | Lab | Purpose & Architectural Overview |
| :--- | :---: | :---: | :--- |
| `src/main.jsx` | **File** | Lab 02 | **React DOM Mounting Point**: Renders root `<App />` component inside `<div id="root"></div>` target using `ReactDOM.createRoot()`. |
| `src/App.jsx` | **File** | Labs 2-4 | **Application Router**: Sets up `BrowserRouter` and maps client routes (`/login`, `/register`, `/home`, `/products`, `/products/:id`, `/wishlist`). |
| `src/services/api.js` | **File** | Labs 2-4 | **Axios API Service**: Configured with `withCredentials: true`. Exposes helper functions: `getProducts`, `getProductById`, `addToWishlist`, `getWishlist`, and `removeFromWishlist`. |
| `src/components/Navbar.jsx` | **File** | Labs 2-4 | **Header Navigation**: Navigation links (`Home | Products | Wishlist (N) | Logout`) featuring dynamic wishlist badge count. |
| `src/components/ProductCard.jsx` | **File** | Labs 3 & 4 | **Product Card UI**: Displays product thumbnail, info, price, stock badge, View Details button, and interactive Wishlist toggle button (`♡ Wishlist` / `⏳ Saving...` / `♥ Saved`). |
| `src/components/SearchBar.jsx` | **File** | Lab 03 | **Search & Filter Bar**: Controlled UI header with live search text input, category `<select>` filter, and price `<select>` sort dropdown. |
| `src/components/WishlistCard.jsx` | **File** | Lab 04 | **Wishlist Item Card**: Displays saved product image, title, category, price, stock availability, **View Details** button, and **Remove ♥** button. |
| `src/pages/Register.jsx` | **File** | Lab 02 | **Registration Page**: Controlled form collecting customer details (fullName, email, password, phone) posting to `/customers/register`. |
| `src/pages/Login.jsx` | **File** | Lab 02 | **Login Page**: Form collecting credentials posting to `/customers/login`. Upon success, redirects user to `/home`. |
| `src/pages/Home.jsx` | **File** | Lab 02 | **Protected User Dashboard**: Calls `GET /customers/me` on mount to display customer profile card. |
| `src/pages/Products.jsx` | **File** | Lab 03 | **Product Catalog Page**: Displays catalog grid, live search, category filter, and price sort dropdown. Handles **Loading**, **Error**, and **Empty** states. |
| `src/pages/ProductDetails.jsx` | **File** | Lab 03 | **Product Details View (`/products/:id`)**: Extracts `:id` using `useParams()`, fetches details from `GET /products/:id`, and renders full product view. |
| `src/pages/Wishlist.jsx` | **File** | Lab 04 | **Wishlist Page (`/wishlist`)**: Fetches `GET /wishlist`, renders dynamic wishlist cards, and manages **Loading**, **Empty** (`[ Browse Products ]`), and **Error** (`[ Try Again ]`) states. |

---

## 🔄 System Architecture & Data Flow Diagrams

### **1. Authentication & Cookie Session Flow (Labs 1 & 2)**
```text
[User] ──► Submits Form (/login) ──► POST /customers/login ──► Compare Hash (bcrypt)
                                                                       │
                                                                       ▼
[Browser] ◄── Set-Cookie: token=<JWT>; HttpOnly ◄── Generate Signed JWT (generateToken.js)
    │
    ▼ Navigates to /home
GET /customers/me (Cookie auto-attached) ──► auth.middleware.js (protect)
                                                   │
                                                   ▼
[User Dashboard] ◄── Return Customer Profile JSON ◄── Verify Signature & Find User
```

### **2. Product Catalog Search & Sorting Flow (Lab 03)**
```text
[User Types in SearchBar / Selects Category or Sort]
       │
       ▼ (State Change: search, category, sort)
  Products.jsx useEffect() Triggers
       │
       ▼ (Axios call with params)
  GET /products?search=keyboard&category=Electronics&sort=price_asc
       │
       ▼
  backend/routes/product.routes.js ──► product.controller.js (getAllProducts)
       │
       ▼ (Dynamic MongoDB Query)
  Product.find({ name: { $regex: 'keyboard', $options: 'i' }, category: 'Electronics' }).sort({ price: 1 })
       │
       ▼
  Returns JSON: { success: true, count: N, products: [...] } ──► Renders ProductCard Grid via .map()
```

### **3. Wishlist Data Lifecycle & Referencing Flow (Lab 04)**
```text
[User Clicks ♡ Wishlist on ProductCard]
       │
       ▼ (Calls Axios API Service)
  POST /wishlist/:productId (with HttpOnly JWT Cookie)
       │
       ▼
  backend/routes/wishlist.routes.js ──► auth.middleware.js (protects & attaches req.user)
       │
       ▼
  wishlist.controller.js (addToWishlist)
       ├─► Check duplicate: customer.wishlist.includes(productId) ──► Yes? Return 409 Conflict
       └─► No? customer.wishlist.push(productId) ──► Save in MongoDB ──► Return 200 OK
       │
       ▼
[User Navigates to /wishlist]
       │
       ▼
  GET /wishlist ──► Customer.findById(userId).populate({ path: 'wishlist', select: 'name price category image stock' })
       │
       ▼
  Returns JSON: { success: true, count: N, wishlist: [ { _id: "...", name: "...", price: ... } ] }
       │
       ▼
  Wishlist.jsx renders WishlistCard Grid dynamically via .map()
```

---

## 🌐 API Reference Documentation

### **Customer Authentication Endpoints (`/customers`)**

| HTTP Method | Endpoint | Access | Request Payload | Success Status | Description |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `POST` | `/customers/register` | Public | `{ fullName, email, password, phone }` | `201 Created` | Registers customer & hashes password via bcrypt. |
| `POST` | `/customers/login` | Public | `{ email, password }` | `200 OK` | Verifies password & sets `HttpOnly` JWT cookie. |
| `GET` | `/customers/me` | Protected | None *(Cookies auto-sent)* | `200 OK` | Returns authenticated customer profile data. |
| `POST` | `/customers/logout` | Protected | None | `200 OK` | Clears `HttpOnly` token cookie. |

---

### **Product Catalog Endpoints (`/products`)**

| HTTP Method | Endpoint | Access | Query Parameters / Body | Success Status | Description |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `POST` | `/products` | Public | `{ name, description, price, category, image, stock }` | `201 Created` | Inserts a new product into MongoDB collection. |
| `GET` | `/products` | Public | `search`, `category`, `sort` | `200 OK` | Returns products matching search regex, category, & price sort order. |
| `GET` | `/products/:id` | Public | Path variable `:id` | `200 OK` | Returns single product details by MongoDB ObjectId. |

---

### **Wishlist Endpoints (`/wishlist`) — Lab 04**

#### 1. Add Product to Wishlist
- **Method & Endpoint**: `POST /wishlist/:productId`
- **Access**: Protected *(Requires valid JWT cookie)*
- **Response (`200 OK`)**:
  ```json
  { "success": true, "message": "Product added to wishlist" }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid auth cookie.
  - `400 Bad Request`: Invalid MongoDB product ID format.
  - `404 Not Found`: Product does not exist in database.
  - `409 Conflict`: Product already exists in user's wishlist.

#### 2. Get Current User's Wishlist
- **Method & Endpoint**: `GET /wishlist`
- **Access**: Protected *(Requires valid JWT cookie)*
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 2,
    "wishlist": [
      {
        "_id": "66d123abc456...",
        "name": "Mechanical Keyboard",
        "price": 2999,
        "category": "Electronics",
        "image": "https://images.unsplash.com/...",
        "stock": 15
      }
    ]
  }
  ```

#### 3. Remove Product from Wishlist
- **Method & Endpoint**: `DELETE /wishlist/:productId`
- **Access**: Protected *(Requires valid JWT cookie)*
- **Response (`200 OK`)**:
  ```json
  { "success": true, "message": "Product removed from wishlist" }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Not authenticated.
  - `400 Bad Request`: Invalid product ID format.
  - `404 Not Found`: Product is not present in user's wishlist.

---

## 🚨 Edge Cases & Error Handling Matrix

| Scenario / Edge Case | System Behaviour & Status Code | User Feedback Experience |
| :--- | :--- | :--- |
| **Product Not Found** | HTTP `404 Not Found` | Displays `"Product not found"` error banner. |
| **Invalid ObjectId Format** | HTTP `400 Bad Request` | Validated via `mongoose.Types.ObjectId.isValid()`. |
| **Unauthenticated User Action** | HTTP `401 Unauthorized` | Automatically redirects user to `/login`. |
| **Duplicate Wishlist Add** | HTTP `409 Conflict` | Returns `"Product already in wishlist"`, preventing duplicates. |
| **Removal of Absent Item** | HTTP `404 Not Found` | Returns `"Product not in wishlist"`. |
| **Empty Wishlist Array** | HTTP `200 OK` (`count: 0`) | Renders Empty State UI (`"Your wishlist is empty ❤️"` + `Browse Products`). |
| **Network / Server Error** | HTTP `500 Internal Server Error` | Renders Error State UI (`"Unable to load wishlist"` + `Try Again`). |

---

## ⚡ Setup & Installation Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/TheVicky1/ShopKart.git
cd ShopKart/backend
npm install
cd ../frontend
npm install
```

### 2. Start Backend Server
```bash
cd backend
node index.js
```
*(Runs on `http://localhost:5000` with automatic in-memory MongoDB fallback and product seeding)*

### 3. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🎓 Comprehensive Viva Examination Preparation Guide (60 Questions)

---

### Category 1: Web & REST API Architecture (Q1 – Q10)

#### Q1: What is a RESTful API and what are its core architectural constraints?
> **Answer:** REST (Representational State Transfer) is an architectural style for designing stateless web APIs. Core constraints include statelessness (server stores no client context), client-server separation, uniform interface (HTTP verbs `GET`, `POST`, `PUT`, `DELETE`), resource identification via URIs, and cacheability.

#### Q2: What is the difference between HTTP `GET`, `POST`, `PUT`, and `DELETE`?
> **Answer:**
> - `GET`: Retrieves resources without modifying server state (safe and idempotent).
> - `POST`: Creates a new resource on the server.
> - `PUT`: Replaces an existing resource or creates it if it doesn't exist.
> - `DELETE`: Removes a resource from the server.

#### Q3: What is the difference between URL Path Parameters and Query Parameters?
> **Answer:**
> - **Path Parameters (`/products/:id`)**: Uniquely identify a specific resource in the hierarchy.
> - **Query Parameters (`/products?category=Electronics&sort=price_asc`)**: Filter, sort, or paginate a collection of resources.

#### Q4: What do HTTP Status Codes 200, 201, 400, 401, 404, 409, and 500 represent?
> **Answer:**
> - `200 OK`: Request succeeded.
> - `201 Created`: Resource successfully created.
> - `400 Bad Request`: Invalid client input or malformed syntax.
> - `401 Unauthorized`: Missing or invalid authentication token.
> - `404 Not Found`: Resource or URI does not exist.
> - `409 Conflict`: Request conflicts with current database state (e.g. duplicate item).
> - `500 Internal Server Error`: Unhandled server exception.

#### Q5: What is CORS and why is it necessary in web applications?
> **Answer:** CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks web pages served from one domain (origin) from requesting APIs on a different domain. In ShopKart, the frontend runs on port `5173` and backend on port `5000`. Enabling CORS on Express allows cross-domain HTTP requests and cookies.

#### Q6: What does `withCredentials: true` do in Axios?
> **Answer:** By default, browsers omit cookies during cross-origin HTTP requests. Setting `withCredentials: true` instructs Axios to include `HttpOnly` session cookies in cross-origin requests.

#### Q7: What is JSON and why is it used for client-server communication?
> **Answer:** JSON (JavaScript Object Notation) is a lightweight, language-independent text format for data interchange. It parses natively into JavaScript objects (`JSON.parse()`).

#### Q8: What is statelessness in REST APIs?
> **Answer:** Statelessness means each HTTP request must contain all necessary authentication data (e.g., in a cookie or header). The server stores no session state about previous requests.

#### Q9: What is the difference between synchronous and asynchronous code execution in JavaScript?
> **Answer:** Synchronous code executes sequentially, blocking subsequent execution until finished. Asynchronous code allows non-blocking execution (e.g. database queries, timers) by returning promises handled via `async/await` or callbacks.

#### Q10: What is an API Contract?
> **Answer:** An API contract defines the agreed-upon interface between frontend and backend, specifying endpoints, HTTP methods, request payloads, headers, response status codes, and error formats.

---

### Category 2: Backend Development & Express.js (Q11 – Q20)

#### Q11: What is Node.js and how does its Event Loop work?
> **Answer:** Node.js is an open-source JavaScript runtime built on Chrome's V8 engine. Its single-threaded Event Loop handles asynchronous I/O operations non-blockingly by delegating long tasks to worker threads and executing callbacks when complete.

#### Q12: What is Express.js middleware and how does `next()` operate?
> **Answer:** Middleware functions have access to `req`, `res`, and `next`. They perform tasks (like auth checking or JSON parsing) and call `next()` to pass control to the next handler in the stack.

#### Q13: What is the Model-View-Controller (MVC) architectural pattern?
> **Answer:**
> - **Model**: Defines database schemas and rules (`customer.model.js`).
> - **View**: Renders UI components on frontend (`Products.jsx`).
> - **Controller**: Handles HTTP requests, business logic, and database operations (`product.controller.js`).

#### Q14: What does `express.json()` middleware do?
> **Answer:** Parses incoming JSON request payloads and populates `req.body` with JavaScript objects.

#### Q15: Why use environment variables via `.env` and `dotenv`?
> **Answer:** Keeps sensitive credentials (database URIs, ports, JWT secrets) out of source code and Git repositories.

#### Q16: What is `cookie-parser` middleware used for in Express?
> **Answer:** Extracts incoming HTTP request cookies and populates `req.cookies`, allowing middleware to read JWT session tokens (`req.cookies.token`).

#### Q17: How does error handling work in async Express controllers?
> **Answer:** Async controllers wrap database operations in `try...catch` blocks to catch runtime exceptions and return structured HTTP error responses (e.g., 500) without crashing the server process.

#### Q18: What is `router.use()` vs `app.use()` in Express?
> **Answer:** `app.use()` mounts middleware globally on the main application object. `router.use()` mounts middleware locally on a isolated Express Router instance (`product.routes.js`).

#### Q19: Why return HTTP `400 Bad Request` when `ObjectId.isValid()` fails?
> **Answer:** Passing malformed ID strings directly into Mongoose triggers cast exceptions. Validating first allows returning clean, immediate `400 Bad Request` error responses.

#### Q20: What is in-memory database fallback (`mongodb-memory-server`)?
> **Answer:** A developer convenience fallback that starts a temporary, local MongoDB server in memory if no external MongoDB instance is running, ensuring backend APIs work seamlessly anywhere.

---

### Category 3: MongoDB & Mongoose Referencing (Q21 – Q30)

#### Q21: What is MongoDB and how does it differ from SQL databases?
> **Answer:** MongoDB is a NoSQL, document-oriented database storing data in flexible BSON documents. Unlike SQL databases (tables, rows, joins), MongoDB is schema-flexible and scales horizontally.

#### Q22: What is Mongoose and why do we use it with Node.js?
> **Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB that provides schema validation, type casting, query building, and document hooks.

#### Q23: Why store Product ObjectIds in the Wishlist array instead of full Product objects?
> **Answer:** Storing `ObjectId` references maintains **Data Normalization**. The `Product` collection remains the single source of truth. Updating a product's price, stock, or image automatically reflects across all wishlists without duplicating or syncing stale data.

#### Q24: What does `ref: "Product"` in `customer.model.js` do?
> **Answer:** Specifies the target model name associated with stored `ObjectId`s, enabling Mongoose `.populate()` to dynamically swap `ObjectId` strings for actual `Product` document objects.

#### Q25: What is the difference between Embedding and Referencing in MongoDB?
> **Answer:**
> - **Embedding**: Storing child documents directly inside parent documents. Best for 1-to-few private relationships.
> - **Referencing**: Storing `ObjectId` pointers to another collection. Best for many-to-many relationships where entities are shared and updated independently (like Products).

#### Q26: How does Mongoose `.populate()` work in `getWishlist`?
> **Answer:** `.populate({ path: 'wishlist', select: 'name price category image stock' })` executes a secondary query to resolve `ObjectId` references in `customer.wishlist` into populated product objects before returning the response.

#### Q27: How do Mongoose schema validations work in `product.model.js`?
> **Answer:** Validations enforce rules before saving: `required: true` prevents missing fields, `min: 0.01` ensures positive prices, and `min: 0` prevents negative stock counts.

#### Q28: What is MongoDB `_id` and what type is it?
> **Answer:** `_id` is a 12-byte unique identifier automatically assigned to documents as a primary key (`ObjectId`).

#### Q29: How are duplicate wishlist entries prevented in the backend?
> **Answer:** The controller checks if `productId` already exists in `customer.wishlist` using `customer.wishlist.some(id => id.toString() === productId)`. If present, it returns an HTTP `409 Conflict` status code.

#### Q30: What is MongoDB `$regex` operator used for?
> **Answer:** Performs regular expression pattern matching on string fields for case-insensitive text search (`query.name = { $regex: safeSearch, $options: 'i' }`).

---

### Category 4: Frontend Development & React Hooks (Q31 – Q40)

#### Q31: What is React and what are its primary advantages?
> **Answer:** React is a component-based UI library. Key advantages include declarative rendering, fast performance via Virtual DOM, unidirectional data flow, and reusable components.

#### Q32: What is the Virtual DOM and how does reconciliation work?
> **Answer:** The Virtual DOM is an in-memory representation of the browser DOM. When state changes, React compares the new Virtual DOM tree against the previous tree ("reconciliation") and updates only changed nodes in the real DOM.

#### Q33: What is the difference between State and Props?
> **Answer:**
> - **State**: Local data managed internally within a component using `useState`. State updates trigger re-renders.
> - **Props**: Read-only properties passed down from parent to child components.

#### Q34: How does `useState` work?
> **Answer:** Returns an array containing the current state value and an updater function (`const [wishlist, setWishlist] = useState([])`). Calling the updater function re-renders the component.

#### Q35: How does `useEffect` work and what is its dependency array?
> **Answer:** Performs side effects (like API fetching). The dependency array controls execution: empty `[]` runs once on mount; `[search, category]` runs on mount and whenever listed state variables change.

#### Q36: How does `.map()` help render lists in React, and why is `key` required?
> **Answer:** `.map()` transforms array data into JSX elements. The `key` prop provides a unique identity for each node, enabling React to track and update list items efficiently.

#### Q37: How does `useParams` work in `ProductDetails.jsx`?
> **Answer:** Extracts dynamic route parameters from URL paths (e.g. `const { id } = useParams()` extracts the `:id` path variable from `/products/:id`).

#### Q38: How does `useNavigate` work?
> **Answer:** Provides a function to trigger client-side page navigation programmatically (e.g., `navigate('/login')`).

#### Q39: What are Controlled Components in React forms?
> **Answer:** Form inputs whose value is bound to state (`value={search}`) and updated explicitly via `onChange` handlers, making React state the single source of truth.

#### Q40: Why should the Wishlist page fetch from the backend instead of using local component state?
> **Answer:** The wishlist is a **persistent feature**. Storing wishlist items only in local React state causes saved items to disappear on page refreshes or device switches. Fetching from the backend ensures data persistence.

---

### Category 5: Authentication & Security (Q41 – Q50)

#### Q41: How does JWT authentication work?
> **Answer:** JSON Web Tokens transmit signed claims between client and server. Upon login, the server signs a token containing the user's ID. Subsequent requests include this token to verify authentication.

#### Q42: Why store JWT in `HttpOnly` Cookies instead of `localStorage`?
> **Answer:** `localStorage` is accessible to client-side JavaScript, exposing session tokens to Cross-Site Scripting (XSS) theft. `HttpOnly` cookies are unreadable by JavaScript (`document.cookie`), keeping tokens safe from XSS extraction.

#### Q43: How does `bcrypt` hash passwords safely?
> **Answer:** `bcrypt` applies a cryptographic salt and configurable work factor to password hashes, making brute-force dictionary attacks computationally expensive.

#### Q44: Why should passwords never be returned in API responses?
> **Answer:** Exposing password hashes risks credential leakage through network logs and client inspection. Passwords are excluded from database queries using `.select('-password')`.

#### Q45: What is Cross-Site Scripting (XSS) and how is it prevented?
> **Answer:** XSS occurs when malicious scripts execute in a user's browser. Prevention includes using `HttpOnly` cookies, sanitizing input, and React's automatic JSX string escaping.

#### Q46: What is Cross-Site Request Forgery (CSRF)?
> **Answer:** CSRF tricks an authenticated user's browser into executing unintended requests. Mitigated by strict CORS configurations, `SameSite` cookie flags, and custom headers.

#### Q47: Why should wishlist APIs never accept `userId` from the request body or URL path (`/wishlist/:userId`)?
> **Answer:** Accepting `userId` introduces an **Insecure Direct Object Reference (IDOR)** vulnerability. A malicious user could pass someone else's ID to view or mutate another user's wishlist. Identity must always come from `req.user._id` set by `protect` middleware.

#### Q48: How does `auth.middleware.js` protect backend routes?
> **Answer:** Reads `req.cookies.token`. If missing, returns `401`. If present, verifies JWT signature, fetches user document from MongoDB, attaches it to `req.user`, and calls `next()`.

#### Q49: What is the purpose of salt in password hashing?
> **Answer:** A salt is a random string added to passwords before hashing to ensure identical plain-text passwords produce distinct hashes, defending against pre-computed Rainbow Table attacks.

#### Q50: What is the role of CORS credentials setting?
> **Answer:** `credentials: true` allows cross-origin requests to transmit credentials (cookies, authorization headers).

---

### Category 6: ShopKart Project Specific Logic (Q51 – Q60)

#### Q51: What are the three UI states on the Wishlist Page (`Wishlist.jsx`) and why are they needed?
> **Answer:**
> 1. **Loading State (`"Loading your wishlist..."`)**: Provides visual feedback while async requests complete.
> 2. **Empty State (`"Your wishlist is empty ❤️"` + `[ Browse Products ]`)**: Guides users when `wishlist.length === 0`.
> 3. **Error State (`"Unable to load wishlist"` + `[ Try Again ]`)**: Handles network failures gracefully.

#### Q52: How does the Wishlist toggle action work on `ProductCard.jsx`?
> **Answer:** Manages localized `inWishlist` state. Clicking the heart button calls `addToWishlist()` if unsaved (updates state to `♥ Saved`) or `removeFromWishlist()` if saved (updates state to `♡ Wishlist`), preventing duplicate clicks via a `saving` state.

#### Q53: How is the Navbar wishlist badge count kept in sync?
> **Answer:** `Navbar.jsx` receives `wishlistCount` as a prop or fetches `GET /wishlist` on mount, displaying a styled numerical badge (`Wishlist (N)`).

#### Q54: What happens when a non-authenticated user clicks `♡ Wishlist`?
> **Answer:** The API call returns HTTP `401 Unauthorized`. The catch block intercepts `401` and redirects the user to `/login`.

#### Q55: Why is product creation (`POST /products`) an open endpoint in Lab 03?
> **Answer:** Lab 03 focuses on product schema modeling and catalog querying. Admin role-based authorization will be added in subsequent labs.

#### Q56: What happens if an image URL fails to load in `ProductCard.jsx`?
> **Answer:** `onError={(e) => e.target.src = 'placeholder...'}` intercepts broken image URLs and seamlessly replaces them with a fallback placeholder.

#### Q57: How does price sorting work in `getAllProducts`?
> **Answer:** Reads `req.query.sort`. If `'price_asc'`, applies `.sort({ price: 1 })`; if `'price_desc'`, applies `.sort({ price: -1 })`.

#### Q58: Why separate API service calls into `services/api.js`?
> **Answer:** Encapsulates Axios configurations, base URLs, and endpoint definitions in one central module, keeping UI components clean and decoupled.

#### Q59: How does `removeFromWishlist` filter items in Mongoose?
> **Answer:** Filters out the target `productId` from `customer.wishlist` array (`customer.wishlist.filter(id => id.toString() !== productId)`) and saves the customer document.

#### Q60: What happens when an empty wishlist is returned from backend?
> **Answer:** Returns `{ success: true, count: 0, wishlist: [] }`. `Wishlist.jsx` evaluates `wishlist.length === 0` and renders the Empty State UI with a `[ Browse Products ]` button.

---

## ✅ Quick Verification & Audit Checklist

| Requirement / Module | Verification Status | Verification Command / Location |
| :--- | :---: | :--- |
| **Lab 01 & 02 Auth APIs** | ✅ PASSED | `POST /customers/register`, `POST /customers/login`, `GET /customers/me` |
| **Lab 03 Catalog Search & Sort** | ✅ PASSED | `GET /products?search=&category=&sort=price_asc\|price_desc` |
| **Lab 04 Wishlist ObjectId Schema** | ✅ PASSED | `backend/models/customer.model.js` (`ref: 'Product'`) |
| **Lab 04 Protected Wishlist APIs** | ✅ PASSED | `POST /wishlist/:productId`, `GET /wishlist`, `DELETE /wishlist/:productId` |
| **Lab 04 React Wishlist Page** | ✅ PASSED | `frontend/src/pages/Wishlist.jsx` (Loading, Empty, Error & Content states) |
| **Lab 04 Viva Q&A Guide** | ✅ PASSED | 60 Questions & Answers across 6 categories in `README.md` |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

*Built with ❤️ for Web Development Lab Course — ShopKart E-Commerce.*
