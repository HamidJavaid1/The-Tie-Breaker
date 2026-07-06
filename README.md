# The Tie Breaker

An AI-powered decision-making assistant that provides weighted pros and cons, comparison tables, and SWOT analyses to help you make confident choices.

## Features

- **AI-Powered Analysis**: Leverages Google's Gemini API for intelligent decision-making insights
- **Weighted Pros & Cons**: Get balanced perspectives on any decision
- **Comparison Tables**: Side-by-side analysis of multiple options
- **SWOT Analysis**: Comprehensive Strengths, Weaknesses, Opportunities, and Threats evaluation
- **Modern UI**: Built with React and Tailwind CSS for a beautiful, responsive interface

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Motion (Framer Motion)
- **Backend**: Express.js
- **AI Integration**: Google Gemini API (@google/genai)
- **Build Tools**: Vite, TypeScript, esbuild

## Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API key

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key to `.env.local`:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `server.ts` - Express server with API endpoints
- `src/` - React frontend components
- `index.html` - Entry HTML file
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## License

This project is private and proprietary.
