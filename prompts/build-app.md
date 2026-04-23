Transform this boilerplate into a focused HSK learning app using `ref.json` as the source of truth.

## Objective
Build a production-ready app with 2 main features:
1. An Anki-like flashcard learning system for Chinese vocabulary.
2. A character map view inspired by [character-map.png](character-map.png).

## Required Work

### 1) Clean the boilerplate
- Remove demo/example code that is not needed for the HSK product.
- Keep only reusable infrastructure that supports the new features.
- Do not break existing project conventions (TypeScript, Next.js app router, existing style and lint setup).

### 2) Global app state with Zustand + persistence
- Add a Zustand store with `persist` middleware for user learning data.
- Store should manage at least:
  - Learning progress per word
  - SRS metadata (`ease`, `interval`, `repetitions`, `nextReviewAt`, `lastReviewedAt`)
  - Current deck/session state
  - User settings relevant to study behavior

### 3) Flashcard feature (Anki-style)
- Build flashcard study UI for entries from `ref.json`.
- Support active recall flow:
  - Show prompt first (e.g., word or meaning)
  - Reveal answer on demand
  - Grade recall quality (e.g., Again / Hard / Good / Easy)
- Implement spaced repetition behavior inspired by Anki (SM-2 style is acceptable).
- Schedule next review based on user grade and SRS values.
- Show only due cards during a review session.

### 4) Character map feature
- Build a character map page similar in spirit to [character-map.png](character-map.png).
- Include common Chinese characters from the dataset and make the view navigable.
- At minimum, each item should surface:
  - Character
  - Pinyin
  - Meaning
- Add search/filter capability to quickly find characters.

## Data Requirements
- Use `ref.json` as the primary vocabulary dataset.
- Keep typing strict: define clear TypeScript types for entries and study records.
- Handle missing or inconsistent fields gracefully.

## Deliverables
- Working implementation of both features.
- Clear file organization and maintainable code.
- Basic tests for core SRS scheduling logic.
- Brief README updates describing how to run and use the new features.

## Implementation Notes
- Make sensible product decisions where details are unspecified.
- Prefer simple, robust UX over over-engineered interactions.
