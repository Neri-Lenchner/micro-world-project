# MicroWorld

## Microservices Full-Stack Project Specification

**Project type:** Full-Stack Distributed Application
**Primary domain:** Marketplace
**Architecture:** Microservices / Event-Driven
**Frontend:** React + TypeScript
**Backend:** Node.js + TypeScript + Express
**Infrastructure:** Docker + Docker Compose
**Messaging:** RabbitMQ
**Cache:** Redis
**Search:** OpenSearch
**Realtime:** Socket.IO
**Database:** MySQL
**CI/CD:** GitHub Actions
**Future orchestration:** Kubernetes

---

# 1. Project Vision

**MicroWorld** is a full-stack marketplace platform designed primarily as a practical microservices and system-design learning project.

The application will allow users to:

* Register and authenticate
* Browse products
* Search products
* Publish products for sale
* Manage listings
* Add products to a watchlist
* Place orders
* Track order status
* Receive notifications
* View real-time updates
* View marketplace analytics

The marketplace is the **business domain**, but the main purpose of MicroWorld is architectural.

The project should demonstrate how a modern distributed application can be designed as a collection of independently responsible services communicating through APIs, events, and message queues.

The goal is not:

> "Build as many services as possible."

The goal is:

> **Understand why each service exists, how the services communicate, and what happens when things go wrong.**

---

# 2. Project Goals

MicroWorld should provide practical experience with:

* Microservice boundaries
* REST APIs
* API Gateway architecture
* Authentication and authorization
* Database ownership
* Synchronous communication
* Asynchronous communication
* Event-driven architecture
* RabbitMQ
* Redis
* Socket.IO
* Search infrastructure
* Distributed workflows
* Concurrency
* Consistency
* Idempotency
* Error handling
* Docker
* CI/CD
* Testing
* Observability
* Kubernetes concepts

---

# 3. High-Level Architecture

```text
                         ┌──────────────────┐
                         │   React Client   │
                         └────────┬─────────┘
                                  │
                           HTTP / WebSocket
                                  │
                         ┌────────▼─────────┐
                         │   API Gateway    │
                         └────────┬─────────┘
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
   ┌─────────────┐        ┌─────────────┐         ┌─────────────┐
   │    Auth     │        │   Catalog   │         │    Order    │
   │   Service   │        │   Service   │         │   Service   │
   └─────────────┘        └─────────────┘         └──────┬──────┘
          │                       │                      │
          ▼                       ▼                      ▼
       MySQL                  MySQL                Inventory
                                                       │
                                                       ▼
                                                 ┌───────────┐
                                                 │ RabbitMQ  │
                                                 └─────┬─────┘
                                                       │
                           ┌───────────────────────────┼───────────────────┐
                           │                           │                   │
                           ▼                           ▼                   ▼
                    Notification                  Analytics            Search
                      Service                     Service              Service
                           │                           │                   │
                           ▼                           ▼                   ▼
                         Email                    Analytics DB        OpenSearch


                         ┌──────────────────┐
                         │      Redis       │
                         └──────────────────┘

                         ┌──────────────────┐
                         │    Socket.IO     │
                         └──────────────────┘
```

---

# 4. Core Architectural Principle

Each service should have a clearly defined responsibility.

For example:

```text
Catalog Service
    owns products

Order Service
    owns orders

Inventory Service
    owns inventory

User Service
    owns user information

Search Service
    owns the search index
```

A service should not directly manipulate another service's database.

For example:

```text
Order Service
      ❌
      ↓
Catalog database
```

Instead:

```text
Order Service
      ↓
Catalog API
```

or through events:

```text
Catalog Service
      ↓
ProductUpdated
      ↓
RabbitMQ
      ↓
Search Service
```

---

# 5. Services

## 5.1 API Gateway

The Gateway is the main entry point for the frontend.

Responsibilities:

* Request routing
* Authentication checks
* Authorization
* Rate limiting
* Request logging
* Centralized error handling
* Service discovery / routing

Example:

```text
/api/auth/*
/api/users/*
/api/products/*
/api/orders/*
/api/payments/*
```

The React application should normally communicate with the Gateway rather than directly with individual services.

---

# 5.2 Auth Service

Responsibilities:

* Registration
* Login
* Password hashing
* JWT generation
* Refresh tokens
* Authentication-related operations

Technology:

```text
Node.js
TypeScript
Express
MySQL
JWT
bcrypt
```

Example:

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

---

# 5.3 User Service

Responsible for user-owned information.

Example:

```text
User
├── id
├── name
├── email
├── avatar
├── createdAt
└── updatedAt
```

The User Service owns this information.

Other services should reference the user's ID rather than directly accessing the User database.

---

# 5.4 Catalog Service

Responsible for marketplace listings.

Example:

```text
Product
├── id
├── sellerId
├── title
├── description
├── price
├── category
├── condition
├── images
├── status
├── createdAt
└── updatedAt
```

Responsibilities:

* Create listing
* Update listing
* Delete listing
* Retrieve product
* List products
* Publish/unpublish listing

---

# 5.5 Watchlist Service

Responsible for user favorites/watchlists.

Example:

```text
WatchlistItem
├── userId
├── productId
└── createdAt
```

Operations:

```text
POST   /watchlist/:productId
DELETE /watchlist/:productId
GET    /watchlist
```

---

# 5.6 Order Service

Responsible for:

* Creating orders
* Order status
* Order history
* Order business rules

Example:

```text
Order
├── id
├── buyerId
├── sellerId
├── productId
├── price
├── status
├── createdAt
└── updatedAt
```

Possible states:

```text
PENDING
CONFIRMED
PAID
SHIPPED
DELIVERED
CANCELLED
```

---

# 5.7 Inventory Service

Responsible for:

* Stock
* Reservation
* Release
* Availability

Example:

```text
Inventory
├── productId
├── quantity
└── reservedQuantity
```

This service introduces important system-design problems.

For example:

```text
Stock = 1

User A → Buy
User B → Buy
```

The system must prevent both users from successfully purchasing the same item.

This introduces:

* Transactions
* Locking
* Race conditions
* Concurrency
* Idempotency
* Consistency

---

# 5.8 Payment Service

The initial version can use a simulated payment provider.

Example:

```text
POST /payments
```

Response:

```json
{
    "paymentId": "pay_123",
    "status": "approved"
}
```

The goal is not initially to process real money.

The goal is to model a distributed payment workflow.

Example:

```text
Create Order
      ↓
Reserve Inventory
      ↓
Process Payment
      ↓
Confirm Order
```

If payment fails:

```text
Create Order
      ↓
Reserve Inventory
      ↓
Payment FAILED
      ↓
Release Inventory
      ↓
Cancel Order
```

---

# 5.9 Notification Service

Responsible for:

* Email
* Order notifications
* Seller notifications
* System notifications

It should primarily consume events.

Example:

```text
OrderCreated
      ↓
RabbitMQ
      ↓
Notification Service
      ↓
Email
```

---

# 5.10 Search Service

Search should be separated from the primary product database.

Technology:

```text
OpenSearch
```

Example:

```text
Catalog Service
      ↓
ProductCreated
      ↓
RabbitMQ
      ↓
Search Service
      ↓
OpenSearch
```

The Search Service can support:

* Full-text search
* Categories
* Price ranges
* Sorting
* Filters
* Fuzzy matching

---

# 5.11 Analytics Service

The Analytics Service consumes marketplace events.

Examples:

```text
ProductViewed
ProductListed
OrderCreated
OrderCompleted
ProductSold
```

Possible analytics:

```text
Products viewed today
Orders today
Revenue
Popular products
Popular categories
Average price
Sales over time
```

React can display this information using:

```text
Chart.js
react-chartjs-2
```

---

# 6. Database Design

## 6.1 Database Ownership

A major microservices principle is **data ownership**.

Conceptually:

```text
Auth Service
    ↓
Auth Database

Catalog Service
    ↓
Catalog Database

Order Service
    ↓
Order Database

Inventory Service
    ↓
Inventory Database
```

For local development, these could initially be separate MySQL databases inside one MySQL container.

Later they can be physically separated if needed.

---

# 6.2 Auth Database

Possible tables:

```text
users
refresh_tokens
```

Example:

```text
users
--------------------------------
id
email
password_hash
created_at
updated_at
```

---

# 6.3 Catalog Database

Possible tables:

```text
products
product_images
categories
```

Example:

```text
products
--------------------------------
id
seller_id
title
description
price
category_id
condition
status
created_at
updated_at
```

---

# 6.4 Order Database

Possible tables:

```text
orders
order_items
```

Example:

```text
orders
--------------------------------
id
buyer_id
seller_id
total
status
created_at
updated_at
```

---

# 6.5 Inventory Database

```text
inventory
--------------------------------
product_id
quantity
reserved_quantity
updated_at
```

---

# 6.6 Watchlist Database

```text
watchlist_items
--------------------------------
user_id
product_id
created_at
```

A useful unique constraint:

```text
UNIQUE(user_id, product_id)
```

This prevents duplicate watchlist entries.

---

# 6.7 Analytics Database

The Analytics Service doesn't necessarily need the same relational model as the transactional services.

It might store aggregated information such as:

```text
daily_sales
product_views
category_statistics
price_history
```

---

# 7. API Design

The API Gateway can expose a consistent external API.

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

---

## Users

```text
GET /api/users/me
PUT /api/users/me
GET /api/users/:id
```

---

## Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

---

## Watchlist

```text
GET    /api/watchlist
POST   /api/watchlist/:productId
DELETE /api/watchlist/:productId
```

---

## Orders

```text
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
PUT  /api/orders/:id/status
```

---

## Payments

```text
POST /api/payments
GET  /api/payments/:id
```

---

## Search

```text
GET /api/search?q=guitar
```

Possible parameters:

```text
?q=guitar
&category=electric-guitar
&minPrice=500
&maxPrice=3000
&sort=price
```

---

# 8. Event Architecture

RabbitMQ is the central message broker.

Example:

```text
                 ┌───────────────┐
                 │  Order Service│
                 └───────┬───────┘
                         │
                    OrderCreated
                         │
                         ▼
                    ┌─────────┐
                    │ RabbitMQ│
                    └────┬────┘
                         │
             ┌───────────┼────────────┐
             │           │            │
             ▼           ▼            ▼
       Notification   Analytics   Inventory
```

---

# 9. Event Examples

## ProductCreated

```json
{
    "event": "ProductCreated",
    "timestamp": "2026-09-16T12:00:00Z",
    "data": {
        "productId": 123,
        "sellerId": 45,
        "title": "Electric Guitar",
        "price": 1200
    }
}
```

Consumers:

```text
Search Service
Analytics Service
```

---

## OrderCreated

```json
{
    "event": "OrderCreated",
    "timestamp": "2026-09-16T12:00:00Z",
    "data": {
        "orderId": 123,
        "buyerId": 45,
        "sellerId": 72,
        "productId": 991,
        "price": 850
    }
}
```

Consumers:

```text
Inventory Service
Notification Service
Analytics Service
```

---

## PaymentCompleted

```text
Payment Service
      ↓
PaymentCompleted
      ↓
RabbitMQ
      ↓
Order Service
```

---

# 10. Event Reliability

The system should eventually consider:

* Duplicate messages
* Lost messages
* Retry logic
* Dead-letter queues
* Idempotency
* Message ordering
* Consumer failures

For example:

```text
OrderCreated
OrderCreated
```

The Notification Service should not necessarily send two emails.

This introduces the concept of **idempotent consumers**.

---

# 11. Synchronous vs. Asynchronous Communication

Use synchronous communication when an immediate answer is required.

Example:

```text
Order Service
      ↓
Inventory Service

"Is this item available?"
```

Use asynchronous communication when the operation can happen independently.

Example:

```text
Order Service
      ↓
OrderCreated
      ↓
RabbitMQ
      ↓
Notification Service
```

The distinction is an important part of the project's system-design learning goals.

---

# 12. Authentication Architecture

The user authenticates through the Gateway:

```text
React
  ↓
Gateway
  ↓
Auth Service
  ↓
JWT
  ↓
React
```

Subsequent requests:

```text
React
  ↓
JWT
  ↓
Gateway
  ↓
Service
```

The Gateway can validate the token before routing the request.

Authorization can then determine whether the user is allowed to perform an operation.

For example:

```text
Seller A
    ↓
PUT /products/123
```

The Catalog Service must verify that Seller A owns product 123.

---

# 13. Redis

Redis can be introduced after the basic architecture works.

Potential uses:

* Product caching
* Popular products
* Rate limiting
* Temporary state
* Short-lived locks
* Session-related data

Example:

```text
Request
   ↓
Catalog Service
   ↓
Redis
   ↓
Cache HIT
   ↓
Return product
```

If there is no cache entry:

```text
Catalog Service
      ↓
Redis MISS
      ↓
MySQL
      ↓
Redis SET
      ↓
Return response
```

---

# 14. Real-Time Architecture

Socket.IO can provide real-time updates.

Example:

```text
Seller lists product
        ↓
Catalog Service
        ↓
ProductListed event
        ↓
RabbitMQ
        ↓
Realtime / Gateway
        ↓
Socket.IO
        ↓
React
```

Possible real-time events:

```text
NEW_PRODUCT
ORDER_UPDATED
PAYMENT_COMPLETED
ORDER_SHIPPED
NEW_NOTIFICATION
```

---

# 15. Search Architecture

The Catalog Service remains responsible for the source-of-truth product data.

OpenSearch becomes a specialized search index.

```text
MySQL
  ↓
Catalog Service
  ↓
ProductUpdated
  ↓
RabbitMQ
  ↓
Search Service
  ↓
OpenSearch
```

This means the search system is eventually consistent with the transactional database.

That is an important concept to understand.

---

# 16. Analytics Architecture

Example:

```text
ProductViewed
ProductListed
OrderCreated
OrderCompleted
ProductSold
        │
        ▼
     RabbitMQ
        │
        ▼
 Analytics Service
        │
        ▼
 Analytics Database
        │
        ▼
      API
        │
        ▼
      React
```

Possible dashboard:

```text
┌─────────────────────────────────────┐
│          Marketplace Analytics      │
├─────────────────────────────────────┤
│                                     │
│ Orders Today          128           │
│ Revenue Today       $14,820         │
│                                     │
│ Sales Over Time       📈            │
│                                     │
│ Popular Categories    📊            │
│                                     │
│ Average Product Price $842          │
│                                     │
└─────────────────────────────────────┘
```

---

# 17. Docker Infrastructure

Initial local infrastructure:

```text
docker-compose.yml

services:

  frontend

  gateway

  auth-service

  user-service

  catalog-service

  order-service

  inventory-service

  payment-service

  notification-service

  search-service

  analytics-service

  mysql

  redis

  rabbitmq

  opensearch
```

The project should be runnable with something conceptually similar to:

```text
docker compose up
```

---

# 18. Development Phases

## Phase 1 — Repository & Infrastructure

Set up:

```text
Git
Docker
Docker Compose
TypeScript
ESLint
Prettier
Environment configuration
```

Create the initial service structure.

---

## Phase 2 — Gateway

Build:

```text
API Gateway
```

Implement:

* Routing
* Error handling
* Logging
* Authentication middleware

---

## Phase 3 — Authentication

Build:

```text
Auth Service
User Service
```

Implement:

* Registration
* Login
* JWT
* Password hashing
* Refresh tokens

---

## Phase 4 — Catalog

Build:

```text
Catalog Service
```

Implement:

* Products
* Categories
* Images
* CRUD
* Seller ownership

---

# 19. Phase 5 — Orders

Build:

```text
Order Service
```

Implement:

* Create order
* Retrieve orders
* Order status
* Validation
* Business rules

---

# 20. Phase 6 — RabbitMQ

Introduce:

```text
RabbitMQ
```

Create the first event:

```text
OrderCreated
```

Then build:

```text
Notification Service
```

as the first event consumer.

---

# 21. Phase 7 — Inventory

Implement:

* Stock
* Reservation
* Release
* Concurrency handling
* Idempotency

Study what happens when two users attempt to purchase the same product.

---

# 22. Phase 8 — Redis

Introduce:

```text
Redis
```

Use it for:

* Caching
* Rate limiting
* Temporary state

Measure the difference between cached and uncached requests.

---

# 23. Phase 9 — Real-Time

Introduce:

```text
Socket.IO
```

Implement real-time:

* Order updates
* Notifications
* New product events

---

# 24. Phase 10 — Search

Introduce:

```text
OpenSearch
```

Implement:

* Full-text search
* Filters
* Sorting
* Categories
* Price ranges

Synchronize the index through events.

---

# 25. Phase 11 — Analytics

Build:

```text
Analytics Service
```

Consume marketplace events and build:

* Sales statistics
* Product views
* Revenue statistics
* Category statistics
* Price history

Display the results with React charts.

---

# 26. Phase 12 — Payment Workflow

Build:

```text
Payment Service
```

Implement:

```text
Create Order
      ↓
Reserve Inventory
      ↓
Process Payment
      ↓
Confirm Order
```

Then implement failure handling.

Example:

```text
Payment fails
      ↓
Release Inventory
      ↓
Cancel Order
```

---

# 27. Phase 13 — Testing

Testing should exist at several levels.

## Unit Tests

Test individual functions and business rules.

```text
Order validation
Inventory calculations
Authorization
Price calculations
```

## Integration Tests

Test:

```text
API
Database
Service interactions
```

## API Tests

Using:

```text
Jest
Supertest
```

Test scenarios such as:

```text
Valid order
Invalid product
Unauthorized request
Out-of-stock product
Payment failure
Duplicate request
```

---

# 28. Phase 14 — CI/CD

GitHub Actions pipeline:

```text
Git Push
   ↓
Install dependencies
   ↓
Lint
   ↓
Run tests
   ↓
Build
   ↓
Build Docker images
   ↓
Publish
   ↓
Deploy
```

The project should eventually have automated checks on every pull request.

---

# 29. Observability

As the project becomes more complex, add observability.

Important concepts:

* Structured logging
* Request IDs
* Correlation IDs
* Health checks
* Error tracking
* Service metrics

Example:

```text
Request ID: req_123

Gateway
   ↓
Order Service
   ↓
Inventory Service
   ↓
RabbitMQ
   ↓
Notification Service
```

A correlation ID should make it possible to trace the request across services.

---

# 30. Failure Scenarios

MicroWorld should deliberately test failures.

Examples:

### Inventory unavailable

```text
Order
 ↓
Inventory
 ↓
TIMEOUT
```

What should happen?

---

### RabbitMQ unavailable

```text
Order created
 ↓
Event cannot be published
```

How should the system handle it?

---

### Payment fails

```text
Payment FAILED
 ↓
Release Inventory
 ↓
Cancel Order
```

---

### Duplicate event

```text
OrderCreated
OrderCreated
```

The consumer should be designed to handle duplicates safely.

---

### Service restart

```text
Catalog Service
      ↓
CRASH
      ↓
RESTART
```

What happens to requests and queued messages?

These scenarios are an important part of learning distributed systems.

---

# 31. Future Kubernetes Deployment

Kubernetes should be introduced only after the Docker Compose version is stable.

The progression should be:

```text
Local Development
      ↓
Docker
      ↓
Docker Compose
      ↓
CI/CD
      ↓
Cloud Deployment
      ↓
Kubernetes
```

Kubernetes concepts to learn later:

```text
Pods
Deployments
Services
Ingress
ConfigMaps
Secrets
Horizontal Pod Autoscaling
Health Checks
Rolling Updates
Persistent Volumes
```

Possible future architecture:

```text
                    Internet
                       │
                    Ingress
                       │
                 API Gateway
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      Auth          Catalog         Orders
        │              │              │
        └──────────────┼──────────────┘
                       │
                    RabbitMQ
                       │
          ┌────────────┼────────────┐
          │            │            │
    Notification    Analytics     Search
```

---

# 32. GuitarFinder Domain Variant

MicroWorld does not have to remain a generic marketplace.

A particularly interesting version would use your **GuitarFinder** concept as the actual business domain.

The services could become:

```text
GuitarFinder / MicroWorld

├── Auth Service
├── Guitar Catalog Service
├── Marketplace Service
├── Watchlist Service
├── Price / Market Service
├── Search Service
├── Notification Service
└── Analytics Service
```

---

# 33. GuitarFinder Event Example

Suppose marketplace pricing changes.

```text
Marketplace Service
        ↓
PriceUpdated
        ↓
RabbitMQ
        ↓
Analytics Service
        ↓
Price History
        ↓
React
        ↓
Market Chart
```

This creates a useful end-to-end architecture:

```text
External Data
      ↓
Service
      ↓
Event
      ↓
Message Broker
      ↓
Analytics
      ↓
Database
      ↓
API
      ↓
React
```

---

# 34. Suggested Repository Structure

A possible monorepo structure:

```text
microworld/
│
├── apps/
│   ├── frontend/
│   └── gateway/
│
├── services/
│   ├── auth/
│   ├── users/
│   ├── catalog/
│   ├── orders/
│   ├── inventory/
│   ├── payments/
│   ├── notifications/
│   ├── search/
│   └── analytics/
│
├── packages/
│   ├── shared-types/
│   ├── event-contracts/
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── rabbitmq/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── package.json
└── README.md
```

The exact structure can change as the project evolves.

---

# 35. Shared Packages

Some code can be shared without sharing business logic.

Good candidates:

```text
shared-types
event-contracts
configuration
logging utilities
```

For example:

```typescript
export interface OrderCreatedEvent {
    event: "OrderCreated";
    timestamp: string;
    data: {
        orderId: number;
        buyerId: number;
        sellerId: number;
        productId: number;
        price: number;
    };
}
```

This reduces inconsistencies between services.

However, avoid creating a huge shared package containing business logic from every service.

That would gradually destroy service independence.

---

# 36. Security Considerations

The project should eventually address:

* Password hashing
* JWT security
* Input validation
* Authorization
* Rate limiting
* SQL injection prevention
* CORS
* Secure headers
* Secrets management
* File upload validation
* API abuse
* Service-to-service authentication

Secrets should never be committed to Git.

Example:

```text
.env
```

should not contain production credentials in the repository.

---

# 37. What You Should Be Able to Explain After Building It

By the end of MicroWorld, you should be able to answer questions such as:

### Why microservices?

What problem does splitting the system solve?

### Why not one Node.js application?

What are the trade-offs?

### Why RabbitMQ?

Why not simply call another REST endpoint?

### Why Redis?

What problem does caching solve?

### Why OpenSearch?

Why not search directly in MySQL?

### Why separate databases?

What does database ownership mean?

### What happens when a service goes down?

How does the rest of the system react?

### What happens when an event is delivered twice?

How do you make consumers idempotent?

### What happens if payment succeeds but the order service crashes?

How does the system recover?

### What happens if two users buy the same product?

How do you protect inventory?

These questions are more valuable than simply being able to say:

> "I built ten microservices."

---

# 38. Portfolio Presentation

The GitHub README should eventually contain:

```text
MicroWorld
────────────────────────────

A full-stack event-driven marketplace
built as a practical microservices architecture.

Tech Stack
────────────────────────────

React
TypeScript
Node.js
Express
MySQL
Redis
RabbitMQ
OpenSearch
Socket.IO
Docker
GitHub Actions

Architecture
────────────────────────────

[Architecture Diagram]

Services
────────────────────────────

[Service Diagram]

Event Flow
────────────────────────────

[Event Diagram]

Local Development
────────────────────────────

docker compose up

Testing
────────────────────────────

npm test
```

The README should explain the architecture rather than simply listing technologies.

---

# 39. Final Development Roadmap

The complete roadmap:

```text
                    MicroWorld
                        │
                        ▼
              ┌─────────────────┐
              │ Docker / Compose│
              └────────┬────────┘
                       │
                       ▼
                  API Gateway
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
            Auth     Catalog   Orders
                                │
                                ▼
                            Inventory
                                │
                                ▼
                            RabbitMQ
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
            Notification    Analytics       Search
                                                │
                                                ▼
                                           OpenSearch

                       Redis
                         │
                         ▼
                     Caching

                     Socket.IO
                         │
                         ▼
                  Real-Time UI

                    GitHub Actions
                         │
                         ▼
                       CI/CD
                         │
                         ▼
                    Deployment
                         │
                         ▼
                    Kubernetes
```

---

# 40. Final Project Goal

The finished project should demonstrate a complete modern distributed application:

```text
React
  ↓
API Gateway
  ↓
Microservices
  ↓
MySQL
  ↓
Redis
  ↓
RabbitMQ
  ↓
Event-driven services
  ↓
OpenSearch
  ↓
Analytics
  ↓
Socket.IO
  ↓
Real-time React UI
  ↓
Docker
  ↓
CI/CD
  ↓
Kubernetes
```

But the central principle remains:

> **Do not build complexity for the sake of complexity.**

Every architectural component should exist because there is a problem it solves.

The project should therefore evolve from a simple application into a distributed system **one architectural problem at a time**.

That approach makes MicroWorld both a practical learning project and a substantial portfolio project.

---

# 41. MicroWorld — Core Principle

**Build it incrementally.**

**Understand every boundary.**

**Understand every communication path.**

**Understand what happens when things fail.**

**Add complexity only when there is a reason for it.**

That is the foundation of the MicroWorld project.
