# DailyMetric

A comprehensive personal daily tracking application that helps you monitor your habits, activities, sleep patterns, productivity, and financial transactions in one place.

## Features

### Dashboard
- **Today's Overview**: Get a quick snapshot of your day with key metrics
- **Activity Tracking**: Log and view daily activities with categories
- **Financial Summary**: Track income and expenses for the current day
- **Sleep Monitoring**: View sleep duration and productivity scores
- **Quick Entry**: Fast input for activities and transactions without leaving the dashboard

### Tracker
- **Historical Data**: View and analyze your activities over time
- **Multiple Views**: Switch between Feed, Table, Calendar, and Board views
- **Date Range Filtering**: Filter data by Today, This Week, This Month, This Year, Last Month, Last 7 Days, or custom ranges
- **Activity Statistics**: Track total days, productivity hours, and average sleep duration
- **Daylog Management**: Edit and update daily logs including bed time and wake time

### Finance
- **Transaction Tracking**: Record income and expenses with notes
- **Balance Overview**: Monitor total balance and monthly financial summaries
- **Date Range Analysis**: View financial data across different time periods
- **Multiple Views**: Feed, Table, and Calendar views for transactions
- **Transaction Editing**: Update existing transactions as needed

### Additional Features
- **Authentication**: Secure login/logout with session management
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **PWA Support**: Install as a progressive web app for offline access
- **Confetti Celebrations**: Visual feedback for achievements
- **Onboarding Tour**: Guided tour for new users
- **Quick Setup**: Initial configuration wizard
- **Error Tracking**: Integrated Sentry for production error monitoring

## Tech Stack

- **Frontend**: React 19.2.7 with React Router 7.18.0
- **Build Tool**: Vite 8.1.0
- **Styling**: Tailwind CSS 3.4.19 with PostCSS
- **State Management**: TanStack React Query 5.101.4 for server state
- **UI Components**: 
  - Headless UI React 2.2.10
  - Material UI 9.2.0
  - Heroicons React 2.2.0
  - Font Awesome 7.3.0
- **Testing**: Cypress 15.19.0 for E2E testing
- **Error Tracking**: Sentry React 10.69.0
- **PWA**: vite-plugin-pwa 1.3.0
- **Linting**: oxlint 1.69.0

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DailyMetric
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `VITE_API_BASE_URL`: Your backend API URL
- `VITE_SENTRY_DSN`: (Optional) Sentry DSN for error tracking

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Testing

Run E2E tests with Cypress:
```bash
npm run test:e2e
```

Open Cypress interactive test runner:
```bash
npm run cy:open
```

Run Cypress tests in headless mode:
```bash
npm run cy:run
```

### Linting

Run the linter:
```bash
npm run lint
```

## Project Structure

```
DailyMetric/
├── src/
│   ├── api/              # API client and request handling
│   ├── components/       # Reusable React components
│   ├── context/          # React context providers (Auth, Toast, Tracker)
│   ├── domain/           # Domain logic and business rules
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Main page components (Dashboard, Tracker, Finance)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component with routing
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── cypress/              # E2E test specifications
├── docs/                 # Documentation files
└── package.json          # Dependencies and scripts
```

## API Integration

The application connects to a REST API with the following features:
- Authentication with session management
- Automatic token refresh
- Activity tracking endpoints
- Financial transaction endpoints
- Analytics and dashboard data
- Daylog management

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for the backend API (default: https://habit-tracker-mfmf.onrender.com)
- `VITE_SENTRY_DSN`: Sentry DSN for production error tracking (optional)

## Deployment

The application can be deployed to various platforms:
- **Vercel**: Use the included `vercel.json` configuration
- **Netlify**: Deploy as a static site
- **Docker**: Containerize the application
- **Static Hosting**: Any static file hosting service

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the repository.