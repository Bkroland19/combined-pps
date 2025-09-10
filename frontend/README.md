# Point Prevalence Survey Dashboard

A modern, responsive dashboard for managing and visualizing Point Prevalence Survey data. Built with Next.js, TypeScript, and Tailwind CSS, and integrates with the Go-based PPS backend API.

## Features

-    **Real-time Dashboard**: Overview of patient statistics, antibiotic usage, and specimen data
-    **Data Visualization**: Interactive charts and graphs using Recharts
-    **Multi-section Navigation**:
     -    Overview: Key metrics and trends
     -    Analytics: Detailed statistical analysis
     -    Patients: Patient distribution by region, facility, and ward
     -    Antibiotics: Antibiotic class, classification, and administration routes
     -    Specimens: Specimen types, culture results, and microorganisms
     -    Data Upload: CSV file upload interface
     -    Database: Recent patient data table
-    **Responsive Design**: Works on desktop, tablet, and mobile devices
-    **Modern UI**: Clean, professional interface with dark mode support

## Backend Integration

This dashboard integrates with the Point Prevalence Survey Go backend API located in the `Point Prevalence Survey/` directory. The API provides the following endpoints:

### Patient Endpoints

-    `GET /api/v1/patients` - List all patients with filtering
-    `GET /api/v1/patients/{id}` - Get specific patient details
-    `GET /api/v1/patients/stats` - Patient statistics

### Antibiotic Endpoints

-    `GET /api/v1/antibiotics` - List all antibiotics with filtering
-    `GET /api/v1/antibiotics/stats` - Antibiotic usage statistics

### Specimen Endpoints

-    `GET /api/v1/specimens` - List all specimens with filtering
-    `GET /api/v1/specimens/stats` - Specimen statistics

### Upload Endpoints

-    `POST /api/v1/upload/patients` - Upload patients CSV
-    `POST /api/v1/upload/antibiotics` - Upload antibiotics CSV
-    `POST /api/v1/upload/indications` - Upload indications CSV
-    `POST /api/v1/upload/optional-vars` - Upload optional variables CSV
-    `POST /api/v1/upload/specimens` - Upload specimens CSV

## Getting Started

### Prerequisites

-    Node.js 18+
-    pnpm (recommended) or npm
-    Point Prevalence Survey Go backend running on port 8080

### Installation

1. **Install dependencies:**

     ```bash
     cd pps
     pnpm install
     ```

2. **Configure API URL:**
   Create a `.env.local` file in the `pps` directory:

     ```env
     NEXT_PUBLIC_API_URL=http://localhost:8080
     ```

3. **Start the development server:**

     ```bash
     pnpm dev
     ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Starting the Backend

Before using the dashboard, make sure the backend API is running:

```bash
cd "Point Prevalence Survey"
docker-compose up -d
# OR
make run
```

The backend will be available at `http://localhost:8080` with Swagger documentation at `http://localhost:8080/swagger/index.html`.

## Project Structure

```
pps/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Loading component
│   └── page.tsx             # Main dashboard page
├── components/
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── api.ts               # API client and types
│   └── utils.ts             # Utility functions
├── hooks/                   # Custom React hooks
├── public/                  # Static assets
└── styles/                  # Additional styles
```

## Key Components

### API Client (`lib/api.ts`)

-    TypeScript interfaces matching backend models
-    `PPSApi` class with methods for all backend endpoints
-    Type-safe data fetching and error handling

### Dashboard (`app/page.tsx`)

-    Main dashboard component with multiple sections
-    Real-time data fetching from backend API
-    Interactive charts and visualizations
-    Responsive navigation sidebar

## Data Flow

1. **Dashboard loads** → Fetches data from multiple API endpoints in parallel
2. **User navigates** → Switches between different data views (overview, analytics, etc.)
3. **Charts render** → Displays real-time data from backend statistics endpoints
4. **Error handling** → Shows user-friendly error messages if backend is unavailable

## Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## Configuration

### Environment Variables

-    `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:8080`)

### API Configuration

The dashboard automatically configures the API client to connect to your backend. Ensure your backend is running and accessible at the configured URL.

## Development

### Adding New Sections

1. Add new sidebar item in `sidebarItems` array
2. Create new section component in the conditional rendering
3. Add appropriate API calls and data visualization

### Customizing Charts

The dashboard uses Recharts for data visualization. You can customize:

-    Chart types (Bar, Pie, Line, Area)
-    Color schemes (defined in CSS variables)
-    Data formatting and labels

## Troubleshooting

### Backend Connection Issues

-    Verify backend is running on port 8080
-    Check API URL configuration in environment variables
-    Ensure CORS is properly configured in backend

### Data Not Loading

-    Check browser console for API errors
-    Verify backend health endpoint: `http://localhost:8080/health`
-    Ensure database is properly connected and migrated

## License

This project is part of the Point Prevalence Survey system for healthcare data management.
