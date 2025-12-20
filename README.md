# The Market's Vote — Data Story

A modern, interactive data story exploring how US presidential elections shape market behavior. We combine 34 years of NASDAQ data with election-season signals to reveal:
- Macro mood: returns vs. volatility through election cycles
- Industry sensitivity: who reacts first when politics moves
- Stock leaning: quiet preferences reflected in price reactions
- Event studies: how single shocks leave fingerprints on the tape

## Quick Start

```bash
npm install
npm run dev
```

Open the local server URL printed in the terminal. Static visualizations are served from the `public/` folder.

## Structure
- `index.tsx`: Main app and chapters
- `public/`: Plotly HTMLs, images, assets
- `vite.config.ts`, `tsconfig.json`: Build and TypeScript config

## Project Links
- Website repo: https://github.com/SjJ1017/ada_penta_data_story
- Analysis repo: https://github.com/epfl-ada/ada-2025-project-penta_data