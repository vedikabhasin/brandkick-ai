# Aesthetic Startup Name Generator

A modern web application that generates unique, memorable startup names with instant domain availability checking.

## Features

- Generate startup names based on your business description
- Choose from different tones (Modern, VC Bait, Gritty, Elegant, Techy, Playful)
- Check domain availability for generated names
- Link directly to domain registrars

## Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a `.env.local` file with your Google Generative AI API key:
   \`\`\`
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   \`\`\`
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Generative AI API key for accessing the Gemini model

## Technologies Used

- Next.js 14
- AI SDK with Google's Gemini model
- Tailwind CSS
- shadcn/ui components
