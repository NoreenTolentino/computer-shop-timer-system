# Computer Shop Timer System

A coin-operated timer system for a computer rental shop (piso net style), built with HTML, CSS, and JavaScript.

**Live Site:**  https://noreentolentino.github.io/computer-shop-timer-system/

## Features

- Prepaid countdown timer for each of the 8 workstations
- Insert coins (1, 5, 10, 20 pesos) to start a session or add time
- Low-time warning in the last 5 minutes and a "Time's up" state
- Undo for the last coin or ended session
- Adjustable hourly rate
- Daily income, sessions, average per session, and a sales log
- Editable workstation names
- Data and running timers persist in the browser (localStorage)

## How billing works

Time is prepaid. Each coin adds time based on the hourly rate (at 10 pesos per hour, 1 peso adds 6 minutes). Time cannot be paused, and income is counted when coins are inserted.

## Run locally

The app uses ES modules, so serve the folder with a static server such as the VS Code Live Server extension.

## Project structure

```
computer-shop-timer-system/
├── index.html
├── css/style.css
└── js/
    ├── app.js
    ├── billing.js
    ├── render.js
    ├── storage.js
    └── utils.js
```
