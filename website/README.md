# Meteora Fee Routing - Pitch Website

Professional multi-page Next.js 14 website for the Meteora DAMM V2 Fee Routing Program bounty submission.

## Overview

This website showcases the complete implementation of the Meteora fee routing program, featuring:

- **Interactive fee calculator** with real-time pro-rata distribution visualization
- **Technical architecture** deep dive with code examples
- **Comprehensive test results** (22/22 anchor tests, 29 total with unit tests)
- **Complete documentation** including API reference and error codes
- **Professional submission** page with team information

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Code Highlighting:** react-syntax-highlighter
- **Icons:** Lucide React

## Project Structure

```
website/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Home page with hero and calculator
│   ├── technical/
│   │   └── page.tsx            # Technical architecture page
│   ├── testing/
│   │   └── page.tsx            # Test results page
│   ├── documentation/
│   │   └── page.tsx            # Documentation page
│   └── submission/
│       └── page.tsx            # Submission details page
├── components/
│   ├── Navigation.tsx          # Responsive navigation bar
│   ├── Footer.tsx              # Footer with links
│   ├── MetricCard.tsx          # Animated metric display
│   ├── CodeBlock.tsx           # Code highlighting with copy button
│   ├── TabGroup.tsx            # Tabbed content switcher
│   ├── ProgressBar.tsx         # Animated progress indicator
│   └── FeeCalculator.tsx       # Interactive fee distribution calculator
├── globals.css                 # Global styles and utilities
└── tailwind.config.ts          # Tailwind configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Navigate to the website directory:

```bash
cd website
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import the project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `website`
   - Click "Deploy"

3. Your site will be live at `https://your-project.vercel.app`

### Deploy to Netlify

1. Build the project:

```bash
npm run build
```

2. Deploy the `out` directory to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `out` folder
   - Or connect your GitHub repository

### Deploy to Other Platforms

For other platforms (AWS, Google Cloud, etc.), build the project and deploy the production build:

```bash
npm run build
npm start
```

## Environment Variables

No environment variables are required for this static website.

## Features

### Home Page (`/`)
- Hero section with project overview
- Key metrics display (22/22 tests, 1,063 lines docs, etc.)
- Problem/Solution breakdown
- Interactive fee distribution calculator
- Call-to-action sections

### Technical Page (`/technical`)
- Two-instruction architecture explanation
- State accounts structure
- PDA seeds and derivation
- Core code examples with syntax highlighting
- Requirements completion tracker

### Testing Page (`/testing`)
- Complete test results (22/22 anchor tests: 5 devnet + 17 integration, plus 7/7 unit tests)
- Quality metrics and code coverage
- Build status and system configuration
- Edge cases tested

### Documentation Page (`/documentation`)
- Quick start guide
- API reference for both instructions
- Error codes with solutions
- Event emissions reference

### Submission Page (`/submission`)
- Team information
- Contact details
- Repository links
- "Why This Wins" section
- Deliverables checklist

## Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: "#6366F1",      // Purple
  secondary: "#06B6D4",    // Cyan
  background: "#0F172A",   // Dark blue
  success: "#10B981",      // Green
  error: "#EF4444",        // Red
  warning: "#F59E0B",      // Yellow
}
```

### Content

All content is located in the page files under `app/`. Edit the respective `.tsx` files to update:
- Text and descriptions
- Metrics and statistics
- Code examples
- Links and contact information

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Fully responsive on all devices

## License

MIT License - see project root for details.

## Contact

**Developer:** RECTOR
**Twitter:** [@RZ1989sol](https://x.com/RZ1989sol)
**GitHub:** [rz1989s](https://github.com/rz1989s)

## Acknowledgments

- Built for the Superteam Meteora DAMM V2 Fee Routing Program bounty
- Program ID: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`
- Repository: [meteora-cp-amm-fee-routing](https://github.com/rz1989s/meteora-cp-amm-fee-routing)
