# గోనుగుంట వారి వంశ వృక్షం (Gonugunta Family Tree)

A modern, responsive, local-first Family Tree application built with React, TypeScript, and Vite.

## Features

- **Interactive Tree Visualization**: Pan and Zoom support.
- **Member Management**: Add, Edit, Delete family members.
- **Bilingual Support**: Toggle between Telugu and English.
- **Local Data Storage**: All data is saved to your device's LocalStorage.
- **Import/Export**: Backup your tree to JSON and restore it anywhere.
- **Search**: Find members quickly by name.
- **PWA Support**: Installable on mobile devices.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    npm run preview
    ```

## Architecture

- **State Management**: `Zustand` with persistence middleware.
- **Styling**: `Tailwind CSS` for utility-first styling.
- **Icons**: `Lucide React`.
- **Tree Layout**: Custom hook (`useTreeLayout`) calculating positions for a generation-based layout.
- **Routing**: `React Router DOM`.
- **I18n**: `i18next` for translations.

## Data Model

- **Member**: Contains basic info (Name, DOB, Gender, Photo) and a list of relationships.
- **Relationship**: Links two members (parent, spouse, child).
- **Branch**: Grouping for members (e.g., specific lineage branch).

## Troubleshooting

- If `npm install` hangs, try running `npm install` again or check your network connection.
- If icons don't load, ensure `lucide-react` is installed.

## Credits

Built for the Gonugunta Family.
