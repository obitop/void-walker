# Void Walker - React + Vite Game Engine

A clean, modular React-based game engine for the Void Walker space horror platformer. Built with Vite for fast development and optimized production builds.

## Project Structure

```
src/
├── game/                    # Core game engine (separate from React)
│   ├── constants.js         # Game constants and tile types
│   ├── utils.js             # Utility functions (math, collision, etc.)
│   ├── GameEngine.js        # Main game orchestrator
│   └── systems/
│       ├── LevelBuilder.js  # Level generation and parsing
│       ├── Physics.js       # Entity movement and collision
│       └── Renderer.js      # Canvas rendering system
├── components/              # React components
│   ├── GameCanvas.jsx       # Main game container
│   └── HUD.jsx              # Head-up display
├── styles/
│   ├── game.css             # Main game styles
│   └── hud.css              # HUD styles
├── App.jsx                  # Root component
└── main.jsx                 # Entry point
```

## Architecture

### Game Engine (Non-React)

The `GameEngine` class runs independently of React's component lifecycle:

- Uses `requestAnimationFrame` for the game loop
- Manages all game state in a centralized `state` object
- Separate systems for physics, rendering, and level generation
- Clean separation of concerns

### React Layer

- `GameCanvas` component hosts the `<canvas>` element
- Polls game state at 20Hz for HUD updates
- Manages game lifecycle (start, retry, end)
- Handles screen transitions (intro, gameplay, game over)

## Quick Start

```bash
npm run dev
```

Visit `http://localhost:5173`

## Features

- **Modular Game Engine**: Clean separation of physics, rendering, and level generation
- **React UI**: Intro screens, HUD, game over states managed by React
- **Vite**: Fast dev server with HMR
- **No External Game Libraries**: Pure Canvas 2D with custom physics and rendering
- **Procedural Levels**: Different challenges in each sector
- **Particle Effects**: Dynamic visual feedback

## Controls

- **Arrow Keys / WASD**: Move left/right
- **Space / Up Arrow**: Jump (double jump available)
- **Z/X**: Shoot
- **Mouse/Touch**: Mobile button controls

## Game Systems

### Physics Engine

- Gravity and velocity
- Collision detection with tiles
- Entity movement and boundaries

### Level Generation

- Procedural terrain
- Random platform placement
- Enemy spawning with difficulty scaling
- Coin distribution

### Rendering System

- Parallax backgrounds with stars and nebulae
- Tile-based level rendering with culling
- Sprite animation
- Particle effects
- HUD overlay

## Extending

Add new game mechanics by modifying:

- `src/game/GameEngine.js` - Main update loops
- `src/game/systems/Renderer.js` - Visual representation
- `src/game/constants.js` - Gameplay parameters

---

Built with React + Vite

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
