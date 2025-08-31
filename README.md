# AI Prompt Generator

A powerful web application that transforms vague user inputs into optimized, effective AI prompts for better communication with AI systems.

## Features

- **Prompt Analysis**: Identifies issues, strengths, and provides improvement suggestions
- **Smart Enhancement**: Uses OpenAI GPT to transform basic prompts into professional ones
- **Real-time Feedback**: Instant analysis and scoring of prompt quality
- **Copy to Clipboard**: Easy copying of enhanced prompts
- **Modern UI**: Clean, responsive design with smooth animations

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up your OpenAI API key in `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Input**: Enter your rough idea or basic prompt
2. **Analysis**: AI analyzes the prompt for clarity, specificity, and effectiveness
3. **Enhancement**: Generates an optimized version with proper structure and context
4. **Copy & Use**: Copy the enhanced prompt for use with any AI system

## Example Transformation

**Before**: "help me write code"

**After**: "Act as a senior software engineer. Help me write clean, well-documented Python code for a REST API that handles user authentication. Include error handling, input validation, and follow PEP 8 standards. Provide code examples with explanations."

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- Heroicons

## Project Structure

```
├── app/
│   ├── api/enhance-prompt/    # API endpoint for prompt enhancement
│   ├── components/            # React components
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── .env.local                # Environment variables
└── package.json              # Dependencies
```
