# Nexus Gear Server

A simple Node.js + Express API backend for the Nexus Gear project.

## Setup

1. `cd server`
2. `npm install`
3. `npm run dev`

The server runs at `http://localhost:4000`.

## Endpoints

- `GET /api/products`
- `GET /api/orders`
- `POST /api/auth/login` (payload: `{ email, password }`)
- `PUT /api/products/:id` (update product)
- `PUT /api/orders/:id` (update order)
- `POST /api/orders` (create order)

## Admin user (stub)

- email: `admin@nexus-gear.test`
- password: `admin123`

## Notes

- Data is in-memory; restart server to reset data.
- Add real DB + secure auth for production use.
