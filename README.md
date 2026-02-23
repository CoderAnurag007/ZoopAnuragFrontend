# Zoop X Anurag (Frontend)

Next.js frontend for the Zoop app: **live selling** — sellers go live and show products, buyers watch and shop.

---

## What You Need

- **Node.js** (v18 or newer)
- The **backend** must be running (e.g. at `http://localhost:4000`) for login, shop, and live features to work.

Clone this github repository code

---

## Setup

```bash
npm install
```

Create a file named `.env.local` in this folder with:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_JWT_SECRET=SECRET_KEY111
```

_(Change the URL if your backend runs elsewhere.)_

---

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pages

| URL                 | Who                    | What it does                              |
| ------------------- | ---------------------- | ----------------------------------------- |
| **/**               | Everyone (after login) | Home; redirects to login if not logged in |
| **/login**          | Everyone               | Log in (buyer or seller)                  |
| **/signup**         | Everyone               | Create account (buyer or seller)          |
| **/shop**           | Everyone               | Browse and buy products                   |
| **/live**           | Buyers                 | Watch live streams, react, comment        |
| **/sell**           | Sellers                | Seller hub                                |
| **/sell/dashboard** | Sellers                | Seller dashboard                          |
| **/sell/products**  | Sellers                | Add and manage products                   |
| **/sell/golive**    | Sellers                | Start/stop live stream and show products  |

### Quick flow

- **Buyer:** Sign up → Login → **Shop** to browse, **Live** to watch streams.
- **Seller:** Sign up as seller → Login → **Products** to add items → **Go Live** to stream.

---

## Navbar

- **Buyers:** Shop Zone, Live, Login/Signup or Logout.
- **Sellers:** Dashboard, Products, Go Live, Shop, Logout.

---

## Troubleshooting

- **API errors or “cannot connect”:**  
  Backend must be running and `.env.local` must have `NEXT_PUBLIC_API_URL` pointing to it (e.g. `http://localhost:4000`).

- **Live / Go Live not working:**  
  Backend must be running (it handles live/WebSocket).

---

## Tech

Next.js 16, React 19, Socket.io client, Axios, React Toastify.
