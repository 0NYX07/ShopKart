# 🧪 Fake Data for Postman Testing

Here are ready-to-use JSON payloads for you to copy and paste into Postman when testing your APIs. Make sure to select **POST** (or PATCH), go to **Body -> raw -> JSON**, and paste the data!

---

### 1. Register a new user (`POST /customers/register`)
```json
{
  "fullName": "`Jane Doe`",
  "email": "jane.doe@example.com",
  "password": "mySuperSecretPassword123",
  "phone": "9876543210"
}
```

### 2. Register another user (`POST /customers/register`)
```json
{
  "fullName": "Alex Smith",
  "email": "alex.smith@example.com",
  "password": "password123",
  "phone": "5551234567"
}
```

### 3. Log In (`POST /customers/login`)
*(Use this after creating the Jane Doe account above!)*
```json
{
  "email": "jane.doe@example.com",
  "password": "mySuperSecretPassword123"
}
```

### 4. Change Password (`PATCH /customers/change-password`)
*(You must be logged in as Jane Doe to do this!)*
```json
{
  "oldPassword": "mySuperSecretPassword123",
  "newPassword": "brandNewPassword2026!"
}
```

### 5. Get My Profile (`GET /customers/me`)
*(No JSON body required! Just make sure you are logged in so Postman automatically sends your Cookie).*

### 6. Logout (`POST /customers/logout`)
*(No JSON body required! This just deletes the Cookie).*

---

### 7. Register a user (Missing Fields - Expect 400 Error)
```json
{
  "fullName": "Incomplete User",
  "email": "incomplete@example.com"
  // Missing password and phone
}
```

### 8. Log In (Wrong Password - Expect 401 Error)
```json
{
  "email": "jane.doe@example.com",
  "password": "wrongPassword123!"
}
```

### 9. Register a Premium User (`POST /customers/register`)
```json
{
  "fullName": "Bruce Wayne",
  "email": "bruce@wayneenterprises.com",
  "password": "iAmBatman2026",
  "phone": "1112223333"
}
```

### 10. Register an International User (`POST /customers/register`)
```json
{
  "fullName": "Yuki Tanaka",
  "email": "yuki.t@example.co.jp",
  "password": "tokyoDriftPassword",
  "phone": "+819012345678"
}
```

---

# 🛒 Lab 03 — Product Catalog & Discovery APIs

### 11. Create a Product (`POST /products`)
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
  "stock": 10
}
```

### 12. Create Product Failure Tests
- **Missing Fields (`POST /products` -> 400 Bad Request):**
```json
{
  "name": "Incomplete Product"
}
```
- **Invalid Price (`POST /products` -> 400 Bad Request):**
```json
{
  "name": "Invalid Price Item",
  "description": "Price must be > 0",
  "price": -100,
  "category": "Electronics",
  "image": "https://example.com/img.jpg",
  "stock": 5
}
```
- **Invalid Stock (`POST /products` -> 400 Bad Request):**
```json
{
  "name": "Negative Stock Item",
  "description": "Stock must be >= 0",
  "price": 499,
  "category": "Electronics",
  "image": "https://example.com/img.jpg",
  "stock": -1
}
```

### 13. Get All Products (`GET /products`)
```http
GET http://localhost:8000/products
```

### 14. Search Products by Name (`GET /products?search=keyboard`)
```http
GET http://localhost:8000/products?search=keyboard
```

### 15. Filter Products by Category (`GET /products?category=Electronics`)
```http
GET http://localhost:8000/products?category=Electronics
```

### 16. Combined Search & Category Filter (`GET /products?search=keyboard&category=Electronics`)
```http
GET http://localhost:8000/products?search=keyboard&category=Electronics
```

### 17. Bonus: Sort Products by Price (`GET /products?sort=price_asc` or `sort=price_desc`)
```http
GET http://localhost:8000/products?sort=price_asc
GET http://localhost:8000/products?sort=price_desc
```

### 18. Get Single Product (`GET /products/:id`)
```http
GET http://localhost:8000/products/PASTE_MONGO_ID_HERE
```
- **Invalid Product ID Test (`GET /products/123` -> 400 Bad Request)**
- **Product Not Found Test (`GET /products/66d123abc456123456789012` -> 404 Not Found)**

---

# ❤️ Lab 04 — Wishlist APIs (Protected Endpoints)

> **Authentication Required:** You must either be logged in (Postman automatically handles Cookies if you ran `POST /customers/login`), OR add the header:
> ```text
> Authorization: Bearer <your_jwt_token_here>
> ```

---

### 19. Add Product to Wishlist (`POST /wishlist/:productId`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/wishlist/<PASTE_PRODUCT_ID_HERE>`
- **Headers:** `Authorization: Bearer <token>` (or logged-in Cookie)
- **Body:** None (empty)
- **Expected Status:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product added to wishlist"
}
```

---

### 20. Prevent Duplicate Wishlist Entry (`POST /wishlist/:productId`)
*(Send the exact same request again with the same productId)*
- **Method:** `POST`
- **URL:** `http://localhost:8000/wishlist/<SAME_PRODUCT_ID>`
- **Expected Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Product already in wishlist"
}
```

---

### 21. Get Current User's Wishlist (`GET /wishlist`)
- **Method:** `GET`
- **URL:** `http://localhost:8000/wishlist`
- **Headers:** `Authorization: Bearer <token>` (or logged-in Cookie)
- **Expected Status:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "count": 1,
  "wishlist": [
    {
      "_id": "6abb7a7772cbfc996b6732d1",
      "name": "Mechanical Keyboard",
      "description": "RGB mechanical keyboard with tactile blue switches...",
      "price": 2999,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
      "stock": 10
    }
  ]
}
```

---

### 22. Remove Product from Wishlist (`DELETE /wishlist/:productId`)
- **Method:** `DELETE`
- **URL:** `http://localhost:8000/wishlist/<PASTE_PRODUCT_ID_HERE>`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Status:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product removed from wishlist"
}
```

---

### 23. Remove Product Not in Wishlist (`DELETE /wishlist/:productId`)
*(Call DELETE again for the product you just removed)*
- **Method:** `DELETE`
- **URL:** `http://localhost:8000/wishlist/<SAME_PRODUCT_ID>`
- **Expected Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Product not in wishlist"
}
```

---

### 24. Unauthenticated Request (`GET /wishlist` or `POST /wishlist/:id`)
*(In Postman, uncheck or remove the Authorization header and clear Cookies)*
- **Method:** `GET` or `POST`
- **URL:** `http://localhost:8000/wishlist`
- **Expected Status:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 25. Invalid Product ID (`POST /wishlist/not-a-valid-id`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/wishlist/12345`
- **Expected Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid product ID"
}
```

---

### 26. Non-Existent Product (`POST /wishlist/60c72b2f9b1d8b2bad000000`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/wishlist/60c72b2f9b1d8b2bad000000`
- **Expected Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Product not found"
}
```

---

### 27. ⭐ Bonus: Wishlist Toggle (`PATCH /wishlist/:productId/toggle`)
- **Method:** `PATCH`
- **URL:** `http://localhost:8000/wishlist/<PRODUCT_ID>/toggle`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Status:** `200 OK`
  - If item wasn't in wishlist -> Added:
    ```json
    {
      "statusCode": 200,
      "success": true,
      "saved": true,
      "message": "Product added to wishlist"
    }
    ```
  - If item was already in wishlist -> Removed:
    ```json
    {
      "statusCode": 200,
      "success": true,
      "saved": false,
      "message": "Product removed from wishlist"
    }
    ```

---

# 🛒 Lab 05 — Shopping Cart & Inventory Management APIs

> All Cart endpoints are protected and require either the `jwt` HTTP-only cookie or an `Authorization: Bearer <token>` header.

### 28. Add Product to Cart (`POST /cart/:productId`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** *(Optional - defaults to quantity 1)*
- **Expected Status:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart updated",
  "cart": [
    {
      "product": {
        "_id": "6ab3b1a6b55e07d5721c4f8d",
        "name": "Mechanical Keyboard",
        "price": 2999,
        "stock": 10,
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "category": "Electronics"
      },
      "quantity": 1
    }
  ]
}
```

---

### 29. Add Same Product Again (Quantity Increments) (`POST /cart/:productId`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Status:** `200 OK`
- **Expected Quantity:** `2`

---

### 30. Get Current User Cart (`GET /cart`)
- **Method:** `GET`
- **URL:** `http://localhost:8000/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Status:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "count": 1,
  "cart": [
    {
      "product": {
        "_id": "6ab3b1a6b55e07d5721c4f8d",
        "name": "Mechanical Keyboard",
        "price": 2999,
        "stock": 10,
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "category": "Electronics"
      },
      "quantity": 2
    }
  ]
}
```

---

### 31. Update Product Quantity (`PATCH /cart/:productId`)
- **Method:** `PATCH`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "quantity": 4
}
```
- **Expected Status:** `200 OK`
- **Expected Quantity:** `4`

---

### 32. Exceed Stock Limit Error (`PATCH /cart/:productId`)
- **Method:** `PATCH`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "quantity": 999
}
```
- **Expected Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Quantity exceeds available stock (10)"
}
```

---

### 33. Quantity Below 1 Error (`PATCH /cart/:productId`)
- **Method:** `PATCH`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "quantity": 0
}
```
- **Expected Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Quantity must be at least 1"
}
```

---

### 34. Remove Product from Cart (`DELETE /cart/:productId`)
- **Method:** `DELETE`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Status:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product removed from cart",
  "cart": []
}
```

---

### 35. Remove Item Not In Cart (`DELETE /cart/:productId`)
- **Method:** `DELETE`
- **URL:** `http://localhost:8000/cart/<PRODUCT_ID>`
- **Headers:** `Authorization: Bearer <token>`
- **Expected Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Product not in cart"
}
```

---

### 36. Unauthenticated Cart Request (`GET /cart`)
- **Method:** `GET`
- **URL:** `http://localhost:8000/cart`
- *(Do NOT send Cookie or Authorization Header)*
- **Expected Status:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Not authorized, no token"
}
```

---

# 💳 Lab 06 — Order Checkout & Payment Simulation APIs

> All Order endpoints are protected and require user authentication (Cookie or `Authorization: Bearer <token>`).

### 37. Create Order Simulation — Mobile Number Only (`POST /orders/create-payment-order`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/orders/create-payment-order`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "shippingAddress": {
    "phone": "9876543210"
  }
}
```
- **Expected Status:** `201 Created`
- **Response contains:** `shopKartOrderId`, `razorpayOrderId`, `demoPaymentId`, `demoSignature`, `amount`, and auto-filled express simulation delivery address!

---

### 38. Create Order — Full Delivery Address (`POST /orders/create-payment-order`)
- **Method:** `POST`
- **URL:** `http://localhost:8000/orders/create-payment-order`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "shippingAddress": {
    "fullName": "Jane Doe",
    "phone": "9876543210",
    "addressLine1": "42 MG Road, Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560038"
  }
}
```
- **Expected Status:** `201 Created`

---

### 39. Simulate Payment SUCCESS (`POST /orders/verify-payment`)
*(Use the `shopKartOrderId`, `razorpayOrderId`, `demoPaymentId`, and `demoSignature` returned from endpoint 37 or 38)*
- **Method:** `POST`
- **URL:** `http://localhost:8000/orders/verify-payment`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "shopKartOrderId": "PASTE_SHOPKART_ORDER_ID_HERE",
  "razorpay_order_id": "PASTE_RAZORPAY_ORDER_ID_HERE",
  "razorpay_payment_id": "PASTE_DEMO_PAYMENT_ID_HERE",
  "razorpay_signature": "PASTE_DEMO_SIGNATURE_HERE"
}
```
- **Expected Status:** `200 OK`
- **Expected Response:** Order status becomes `PLACED`, `paymentStatus: "PAID"`, inventory stock is decremented, and user cart is cleared!

---

### 40. Simulate Payment FAILURE (`POST /orders/record-failure`)
*(Simulate bank rejection, insufficient funds, or gateway timeout)*
- **Method:** `POST`
- **URL:** `http://localhost:8000/orders/record-failure`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "shopKartOrderId": "PASTE_SHOPKART_ORDER_ID_HERE",
  "reason": "Insufficient account balance in customer bank account"
}
```
- **Expected Status:** `200 OK`
- **Expected Response:** Order status remains `PENDING_PAYMENT`, `paymentStatus: "FAILED"`, and cart items remain intact!

---

### 41. Simulate Payment Verification Failure (`POST /orders/verify-payment`)
*(Simulate explicit gateway decline via verification endpoint)*
- **Method:** `POST`
- **URL:** `http://localhost:8000/orders/verify-payment`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body (raw JSON):**
```json
{
  "shopKartOrderId": "PASTE_SHOPKART_ORDER_ID_HERE",
  "simulateFailure": true,
  "failureReason": "Bank server gateway timeout (HTTP 504)"
}
```
- **Expected Status:** `400 Bad Request`
- **Expected Response:** `paymentStatus` is recorded as `FAILED`.




