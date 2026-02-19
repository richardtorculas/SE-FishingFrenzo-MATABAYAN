# MataBayan Frontend Dashboard

React + Tailwind CSS implementation of the MataBayan disaster alert dashboard.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Design Specifications

- **Dark Blue**: #355872
- **Light Blue**: #7AAACE
- **Sticky Navbar**: Top navigation bar
- **Sticky Sidebar**: Left vertical panel
- **Category Buttons**: Typhoon, Earthquake, Eruption

## Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── CategoryPanel.jsx
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```
