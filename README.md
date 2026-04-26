# HSK Index

A Chinese vocabulary learning app for HSK exam preparation. Study words with spaced repetition flashcards and explore characters with an interactive character map — all in one page, with optional account sync.

## Features

### Flashcards (Spaced Repetition)
- SM-2 algorithm with 4 grade buttons: **Again**, **Hard**, **Good**, **Easy**
- Cards are scheduled based on your review history — words you struggle with appear more often
- Progress persists in your browser (localStorage) without an account
- Sign in to sync your progress to the cloud and keep it across devices

### Character Map
- **Common characters sidebar** — browse the most frequent HSK characters, each color-coded by your learning status
- **Search / filter** — type a character, pinyin, or English meaning to narrow down the list
- **Detail panel** — click a character to see all HSK words that contain it, with pinyin, meanings, and part of speech
- **Word explorer** — full search across all HSK words; toggle meanings visibility; click any word to open its flashcard

### Color coding
| Color | Meaning |
|-------|---------|
| Blue | New — not studied yet |
| Red | Learning — needs more review |
| Green | Review — well-learned |

### Auth & Sync
- Email + password authentication (bcrypt + server-side pepper, JWT session cookie)
- On login, local progress is pulled from MongoDB then silently kept in sync as you review
- No account required to use the app

### Localization
- English and French UI via `next-intl`

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (persist to localStorage) |
| Database | MongoDB (native driver) |
| Auth | JWT (`jose`) + bcrypt |
| i18n | next-intl |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env .env.local
```

Edit `.env.local`:

```env
# MongoDB connection string
MONGODB_URI=mongodb://admin:admin@localhost:27017/hsk-index?authSource=admin

# Random secret mixed into bcrypt hashes — generate once and never change
PASSWORD_PEPPER=<random-base64-string>
```

Generate a pepper:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Run locally

```bash
# Start MongoDB (if using Docker)
docker compose -f docker-compose.mongo.yaml up -d

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/[locale]/
│   ├── (auth)/          # Routes requiring authentication
│   ├── (unauth)/        # Auth pages (sign-in, sign-up)
│   └── page.tsx         # Home page — flashcards + character map
├── features/
│   ├── character-map/   # Character sidebar + explorer
│   └── flashcards/      # Flashcard display + SM-2 logic
├── hooks/
│   └── useFlashcardSync.ts  # localStorage ↔ MongoDB sync
├── libs/
│   ├── Auth.ts          # JWT sign/verify, session cookie
│   └── MongoDB.ts       # DB singleton
└── store/               # Zustand flashcard store
```

## License

MIT
