# TalentHub - HR Dashboard

![TalentHub Dashboard](public/abstract-geometric-shapes.png)

## Overview

TalentHub is a comprehensive HR management platform designed to streamline recruitment, candidate assessment, and talent management processes. This modern dashboard provides HR professionals with powerful tools to manage job listings, track candidates, gain insights through analytics, and communicate effectively with team members and candidates.

## Features

- **Job Management**: Create, edit, and track job listings with detailed information
- **Candidate Tracking**: Manage candidate profiles, applications, and interview processes
- **Analytics Dashboard**: Visualize recruitment metrics and talent acquisition insights
- **AI-Powered Chat**: Communicate with team members and candidates through an intelligent chat interface
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js 14, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Authentication**: Built-in authentication system + Google Oauth
- **AI Services**: Integration with speech-to-text and text-to-speech APIs
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Blackstocks/hr_dashboard
   cd hr_dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
   

## Project Structure

```
talenthub/
├── app/                    # Next.js App Router structure
│   ├── dashboard/          # Dashboard pages (jobs, candidates, insights)
│   ├── auth/               # Authentication pages (login, register)
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout with metadata
├── components/             # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   ├── charts/             # Data visualization components
│   ├── forms/              # Form components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility functions and helpers
├── public/                 # Static assets and images
├── styles/                 # Additional styling
├── types/                  # TypeScript type definitions
├── next.config.js          # Next.js configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```


## Key Features Breakdown

### Dashboard Overview
The main dashboard provides a comprehensive overview of:
- Active job listings
- Candidate pipeline metrics
- Upcoming interviews
- Recent applications
- Team performance indicators

### Job Management
- Post new job listings with customizable templates
- Set qualification requirements and screening questions
- Track application status and candidate progression

### Candidate Tracking
- AI-powered resume parsing and skill matching
- Interview scheduling and feedback collection
- Automated communication workflows

### Analytics and Reporting
- Recruitment funnel visualization
- Time-to-hire and cost-per-hire metrics
- Source effectiveness analysis
- Custom report generation


## Acknowledgments

- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Charts created with [Recharts](https://recharts.org/)
- Icons from [Lucide React](https://lucide.dev/)

---
