# Project Brief — On the Other Side

This document is the vision: what we are building and why. Concrete decisions and the
step-by-step plan for the current version live in [plan-0.1.md](./plan-0.1.md); the survey of
existing visual novel engines those decisions lean on is in
[engine-research.md](./engine-research.md).

## Goal

Build a visual novel as a **web application** using the existing frontend stack (React + TypeScript).

The project should prioritize:

- fast development;
- clean architecture;
- easy experimentation.

The game itself comes first. The engine should naturally emerge from the game's needs rather than being designed upfront.

---

# Tech Stack

Core:

- React
- TypeScript
- Vite

State:

- MobX

Styling:

- styled-components

Rendering (initially):

- React DOM
- HTML/CSS

Tooling:

- ESLint
- Prettier

Content:

- TS modules committed to this repo, typed as a discriminated union

Not needed for now:

- React Query
- backend
- database

Backend and database may appear later, once local files stop being enough. JSON stays an
option for future external data — a content editor, downloadable chapters — but the story
itself is written in TypeScript, for the sake of autocomplete and compile-time checks.

Everything should work offline.

---

# Development Philosophy

Do NOT build a generic game engine.

Instead:

Game
↓
Engine grows from the game

The first goal is having a playable visual novel.

Not:

- plugin system
- editor
- scripting language
- modding support

Those can appear later if needed.

---

# High-Level Architecture

The application itself follows **Feature-Sliced Design**.

The engine and the story content live outside the FSD layers — neither of them is
application-specific, and both should be replaceable without touching the app.

```
src/

  app/        # FSD: init, providers, global styles, routing
  pages/      # FSD: screens (menu, game, settings)
  widgets/    # FSD: composite blocks (dialogue box, character layer)
  features/   # FSD: user actions (advance dialogue, pick a choice, save/load)
  entities/   # FSD: domain entities (character, scene, save slot)
  shared/     # FSD: ui-kit, libs, types, config

  engine/     # engine systems — knows nothing about the story
    dialogue/
    navigation/
    save/
    audio/
    rendering/

  content/    # the story as data
    intro.ts
    chapter1.ts
    *.json

  assets/
    backgrounds/
    characters/
    music/
    sfx/
```

Open question: whether `engine/` eventually moves under `shared/` or stays a
top-level sibling of the FSD layers.

---

# Engine Responsibilities

The engine should know nothing about specific characters or story.

It should only provide systems:

- scene rendering
- dialogue progression
- choices
- variables
- save/load
- audio
- transitions

Story content should live separately, in `content/`.

---

# Content Format

The story should be data-driven.

Example:

```tsx
const intro = [
  {
    type: "background",
    asset: "room"
  },

  {
    type: "character",
    id: "anna",
    emotion: "happy"
  },

  {
    type: "say",
    speaker: "Anna",
    text: "Hi!"
  },

  {
    type: "choice",
    options: [
      {
        text: "Hello",
        next: "hello"
      },
      {
        text: "Leave",
        next: "leave"
      }
    ]
  }
];
```

The engine simply interprets these commands.

---

# Game State

Global state example:

```tsx
class GameStore {
  currentScene;
  currentStep;

  flags;

  variables;

  settings;
}
```

Managed with MobX: observable state, actions for mutations, observer components.

---

# Save System

Initially:

- localStorage

Saved data:

```tsx
{
    currentScene,
    currentStep,
    flags,
    variables
}
```

Future:

- multiple save slots
- autosave

---

# Initial MVP

Version 0.1 should only support:

- background
- character sprite
- dialogue
- next button
- choices
- scene switching
- music
- save/load

Nothing more.

---

# UI Layout

Typical screen:

```
+------------------------------------+

          Background

      Character Sprite

--------------------------------------

 Dialogue Box

 [ Next ]
```

Everything can be built using React components.

No PixiJS required.

---

# Why Not PixiJS Yet?

A visual novel is mostly:

- images
- text
- music
- branching

React is perfectly capable of rendering this.

PixiJS should only be introduced when features require it.

Examples:

- world map
- inventory
- animated scenes
- particle effects
- camera
- mini-games

Whether PixiJS is needed at all is still an open question — to be decided when
such a feature actually shows up.

---

# Possible Hybrid Architecture

A sketch, not a decision.

React remains the application shell.

Example flow:

```
Dialogue Scene (React)

↓

Player exits house

↓

World Map (PixiJS)

↓

Select location

↓

Back to Dialogue (React)
```

PixiJS would become a specialized renderer rather than replacing the application.

---

# Cross-Platform

Undecided.

The first and only committed target is the **web**: deployable immediately, can be
shared with testers via URL.

Desktop and mobile builds may follow. The packaging tooling is not chosen yet —
Tauri and Capacitor are candidates, nothing more. Business logic should remain
unchanged either way, which is the actual reason to keep the engine free of
direct platform APIs.

---

# Long-Term Vision

The architecture should naturally evolve into a lightweight visual novel engine
while remaining focused on the actual game.

Future additions may include:

- animations
- transitions
- localization
- achievements
- editor
- scripting helpers
- map system
- inventory
- mini-games

These features should be added only when required by the game.

---

# Core Principle

The game is the product.

The engine is a by-product of building the game.

Avoid premature abstraction.
Build only what the current game needs.
