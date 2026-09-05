import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DatasetsPage } from './pages/DatasetsPage';
import { StudentsPage } from './pages/StudentsPage';
import { DrivesPage } from './pages/DrivesPage';
import { CreateDrivePage } from './pages/CreateDrivePage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/datasets" replace />} />
            <Route path="datasets" element={<DatasetsPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="drives" element={<DrivesPage />} />
            <Route path="create-drive" element={<CreateDrivePage />} />
            <Route path="*" element={<Navigate to="/datasets" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
