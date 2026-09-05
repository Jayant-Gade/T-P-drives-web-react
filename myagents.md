# My Agents - T&P Cell Placement Management System

## Overview
This document tracks agents, system modules, and execution status for the T&P Cell Placement Management System.

## Active Modules & Agents
- **Modal Overlay & Interaction Agent**: Enforced click-outside-to-close backdrop behavior (`onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}`) with event propagation stops across all modals (`SettingsModal`, `CsvUploadModal`, `StudentsPage` drive history modal, `DrivesPage` drive inspector modal). Lowered `CsvUploadModal` vertical positioning (`pt-16 sm:pt-20 mt-2 sm:mt-4`) below top Navbar height while floating above all UI elements with high z-index (`z-[100]`).
- **CSV Column Mapping Agent**: Built interactive **Column Mapping & Header Verification Window** step in Datasets page (`DatasetsPage.tsx`). Automatically detects CSV headers, auto-assigns target schema fields using smart Regex matching (`/roll|reg/i`, `/cgpa|pointer/i`, etc.), displays manual dropdown selectors with live sample value previews, and parses custom-ordered CSV files for MongoDB import.
- **Git Repository Agent**: Initialized Git repository in root `d:\Projects\tandpecell`, connected remote origin `https://github.com/Jayant-Gade/T-P-drives-web-react.git`, and pulled remote `main` branch.
- **Demo Mode Agent**: Built interactive Demo Mode toggle in UI Settings (`SettingsModal.tsx`) and persistent top Navbar indicator button (`Navbar.tsx`). Allows seamless 1-click switching between live Node.js MongoDB Backend API Mode and standalone Static Mock Data Mode (`mockData.ts`), immediately re-syncing datasets, students, and drive records on toggle on/off.
- **Full-Stack Dynamic Backend Data Agent**: Verified 100% dynamic data fetching from Node.js Express REST API (`/api/datasets`, `/api/students`, `/api/drives`, `/api/eligibility`) connected to MongoDB.
- **Responsive Layout & Navigation Agent**: Implemented responsive Navigation Dropdown Menu in `<Navbar />` (`Navbar.tsx`) that combines the 4 core page options (`Datasets & CSV`, `Student Directory`, `Drive Records`, `Create Drive`) when screen width or text scaling causes overflow. Protected buttons and control badges in `index.css` (`button, .btn, .badge { white-space: nowrap !important; flex-shrink: 0; }`) so text truncation does not break button bounds.
- **Full-Stack REST Integration Agent**: Connected all 4 frontend pages (`/datasets`, `/students`, `/drives`, `/create-drive`) to the Node.js Express Backend REST API via `api.ts` client module. Added live `Backend Connection Status` indicator badge (`API Connected` / `Demo Mode`) to the top navbar.
- **Typography & Font Agent**: Fixed CSS font family override rules in `index.css` and updated `AppContext.tsx` so font changes in Settings apply instantly and reliably across all UI components.
- **Backend Architecture Agent**: Built complete Node.js + Express + Mongoose REST API server in `backend/` folder including models (`User`, `StudentDataset`, `Student`, `PlacementDrive`, `EligibilityRecord`), services (`csvParserService`, `eligibilityService`), utilities (`astTranslator.js`), controllers (`datasetController`, `studentController`, `driveController`, `eligibilityController`), routes, middlewares, `.env`, and `server.js` entry point.
- **Frontend Architecture Agent**: Built persistent UI Settings Engine (`SettingsModal.tsx`), standalone top `<Navbar />` component with settings trigger button (`Navbar.tsx`), resolved CSS `@import` order for Tailwind CSS v4, and fixed TypeScript ESM module bundler type exports (`import type`) across all components.
- **UI Customization Agent**: Implemented `localStorage` persistent UI settings (`fontScale`, `textWrap`, `fontSize`, `uiScale`, `fontFamily`: Inter, Roboto, Outfit, Fira Code, System, `isDemoMode`) applied dynamically to root CSS custom variables.

## System Components Status
- [x] Click-Outside Backdrop to Close Modal on all popups (`CsvUploadModal`, `SettingsModal`, `StudentsPage` drive history modal, `DrivesPage` drive inspector modal)
- [x] Upload Modal Positioned Below Top Navbar with `pt-16 sm:pt-20` and `max-h-[84vh]`
- [x] Full Screen Modal Overlays Above Navbar (`z-[100]` / `z-[110]`) with Frosted Glass Backdrop Blur (`bg-slate-950/75 backdrop-blur-md`) across all popups
- [x] Extracted Standalone CSV Upload & Column Mapping Modal Component (`frontend/src/components/datasets/CsvUploadModal.tsx`)
- [x] Fixed Modal Z-Index Stacking Context: Removed `animate-fade-in` from `<main>` container in `AppLayout.tsx`, adjusted Navbar to `z-30`, and elevated CSV Stepper Modal, Drive History, Inspector, and Settings Modals to `z-[100]` / `z-[110]` so popups never go behind top Navbar.
- [x] Complete Removal of Static Demo Data when Returning to API Mode (Pure MongoDB REST API State)
- [x] Refreshed useCallback & useEffect Component Dependencies List Across App Context
- [x] Configured `.gitignore` files for root (`.gitignore`), backend (`backend/.gitignore`), and frontend (`frontend/.gitignore`)
- [x] Connected Git Remote Origin `https://github.com/Jayant-Gade/T-P-drives-web-react.git` & pulled `main`
- [x] Instant Data Re-Sync on Demo Mode Toggle On / Off
- [x] Top Navbar Demo Mode Toggle Button & Indicator (`⚡ Demo Mode (Static Data)`)
- [x] Settings Modal Demo Mode Switch (`SettingsModal.tsx`) with localStorage persistence
- [x] Dual-Mode State Engine in `AppContext.tsx` (Static mock data vs Live MongoDB API)
- [x] Responsive Navigation Dropdown Menu for compact/overflow views in Navbar
- [x] Protected buttons from overflowing during `app-nowrap` text truncation mode
- [x] Full Frontend REST API Integration (`services/api.ts`) connecting all 4 pages to Node.js backend (`/api/datasets`, `/api/students`, `/api/drives`, `/api/eligibility`)
- [x] Fixed font setting overrides in `index.css` & `AppContext.tsx` for 100% reliable font changing
- [x] Full Node.js + Express + Mongoose REST API Backend (`backend/`)
- [x] MongoDB Schemas with compound indexes (`User`, `StudentDataset`, `Student`, `PlacementDrive`, `EligibilityRecord`)
- [x] AST Translator Utility converting frontend JSON AST rules into native MongoDB query objects
- [x] CSV Stream Parser & Validation Service (`csvParserService.js`)
- [x] Eligibility Calculation & Historical Snapshot Service (`eligibilityService.js`)
- [x] Tailwind CSS v4 & `@tailwindcss/vite` integration
- [x] Full-Screen UI Customization Settings Modal overlay (`SettingsModal.tsx`)
- [x] Persistent UI Settings (Font Size, Text Scaling, Text Wrapping, UI Layout Density, Typography Types, Demo Mode) saved to `localStorage`
- [x] Standalone Top Navbar component (`Navbar.tsx`) with Top Settings trigger button and API status indicator
- [x] Updated Architecture Blueprint (`project architecture.md`)
- [x] Page 1: Student Datasets & CSV Upload (`/datasets`)
- [x] Page 2: Student Directory & Student Drive History (`/students`)
- [x] Page 3: Drive History Records & Historical Snapshots (`/drives`)
- [x] Page 4: Create Placement Drive & Dynamic AST Filter Builder (`/create-drive`)
- [x] Global React Context & HSL Glassmorphism Design System
