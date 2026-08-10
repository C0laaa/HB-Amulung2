# ☕ Honey Bakes Cafe — Online Ordering & POS System

A full-stack, responsive web application for **Honey Bakes Cafe** (located in Zone 5, Calamagui, Amulung, Cagayan). It provides a smooth online ordering experience for customers alongside an administrative Point-of-Sale (POS) and order management portal.

---

## ✨ Key Features

### 🛍️ Customer Ordering Experience
- **Interactive Menu & Customization**: Browse handcrafted coffees, teas, blended pastries, and savory meals with options for size, temperature (Iced/Hot), milk upgrades, and extra toppings.
- **Auto-Filled Customer Details**: Automatically remembers and auto-populates the customer's name, mobile number, and address from saved account profiles or recent order histories.
- **Smart Delivery System**:
  - **Allowed Barangays**: Supports home delivery strictly within designated Amulung, Cagayan barangays (*Calamagui, Estefania, Conception, Anquiray, Centro, Baculud, Dugayung, Gabut, Monte Alegre, and Jurisdiccion*).
  - **Distance & Fee Calculation**: Dynamically computes highway delivery fees starting from the Zone 5 Calamagui base location.
  - **Minimum Order Requirement**: Clear ₱350 product subtotal minimum requirement for home delivery orders with real-time progress bar feedback.
- **GCash Payment Receipt Verification**: Integrated GCash payment workflow with image upload compression for payment receipt proofs.
- **Live Order Status Tracking**: Real-time status tracker for customers (Pending, Preparing, En Route / Ready for Pickup, Completed).

### 🛡️ Admin & Cashier Portal
- **Real-Time Order Queue**: Live dashboard to review incoming orders, inspect uploaded GCash receipts, update order status, and track daily sales metrics.
- **Delivery Dispatch Map**: Visual route map for riders dispatching orders across Amulung barangays.
- **Stock & Menu Management**: Quick toggle for item availability and menu updates.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Animations), Lucide React (Icons)
- **Backend & Persistence**: Node.js, Express, Firebase Firestore & Firebase Authentication
- **Build Tools**: Vite, esbuild, tsx

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` or `.env.example`:
   ```env
   # Firebase Config (Optional / Auto-configured via AI Studio)
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_PROJECT_ID=
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server on port `3000`.
- `npm run build`: Compiles production build artifacts into `dist/`.
- `npm run lint`: Validates TypeScript type safety without emitting files.
- `npm run clean`: Cleans build outputs and temporary server files.

---

## 📍 Store Location

**Honey Bakes Cafe**  
Zone 5, Calamagui, Amulung, Cagayan, Philippines
