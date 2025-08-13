# Perspectiv - AI Chatbot Application

A modern React-based chatbot interface built with Vite, featuring a beautiful UI and n8n workflow integration.

## Features

- 🎨 Modern, responsive design with smooth animations
- 🤖 AI chatbot powered by n8n workflows
- 📱 Mobile-friendly interface with collapsible chat
- 🔐 Authentication system (Supabase)
- 🎯 Service-focused landing page

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- n8n instance with a webhook workflow

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # N8N Webhook Configuration
   VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Chatbot Configuration

The chatbot is designed to work with n8n workflows. When a user sends a message:

1. The message is sent to your n8n webhook
2. Your workflow processes the message (e.g., calls an AI service)
3. The response is returned and displayed in the chat

### Expected n8n Webhook Payload

The chatbot sends the following data to your webhook:

```json
{
  "session_id": "unique-session-id",
  "user_id": "optional-user-id",
  "chatInput": "user message",
  "message": "user message",
  "history": [
    {
      "role": "user|assistant",
      "content": "message content"
    }
  ]
}
```

### Expected n8n Response

Your workflow should return a response that can be parsed by the chatbot. The chatbot looks for text in the following order:

1. `content`
2. `value`
3. `output`
4. `reply`
5. `text`
6. `answer`
7. `choices[0].message.content`

## Development

- Built with React 18 and Vite
- Uses Tailwind CSS for styling
- ESLint configuration included
- Hot Module Replacement (HMR) enabled

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
