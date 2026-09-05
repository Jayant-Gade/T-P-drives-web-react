import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { StudentDataset, Student, PlacementDrive, EligibilityRecord, FilterAST, UISettings } from '../types';

import { filterStudents } from '../services/filterEngine';
import {
  checkBackendHealth,
  apiFetchDatasets,
  apiConfirmDatasetImport,
  apiFetchStudents,
  apiFetchStudentDriveHistory,
  apiFetchDrives,
  apiCreateDrive,
  apiPreviewEligibility,
  apiFetchEligibleStudentsForDrive,
} from '../services/api';

import {
  INITIAL_DATASETS,
  INITIAL_STUDENTS,
  INITIAL_DRIVES,
  INITIAL_ELIGIBILITY_RECORDS,
} from '../services/mockData';

const DEFAULT_UI_SETTINGS: UISettings = {
  fontSize: 'base',
  textScale: 100,
  textWrap: true,
  uiScale: 'normal',
  fontFamily: 'Inter',
  isDemoMode: false,
};

interface AppContextType {
  datasets: StudentDataset[];
  students: Student[];
  drives: PlacementDrive[];
  eligibilityRecords: EligibilityRecord[];
  activeDatasetId: string;
  setActiveDatasetId: (id: string) => void;
  activeDataset: StudentDataset | undefined;
  uiSettings: UISettings;
  updateUISettings: (updates: Partial<UISettings>) => void;
  resetUISettings: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isBackendConnected: boolean;
  isLoading: boolean;
  addDatasetWithStudents: (datasetName: string, academicYear: string, parsedStudents: Omit<Student, 'id' | 'datasetId'>[]) => Promise<StudentDataset>;
  createPlacementDrive: (driveData: Omit<PlacementDrive, 'id' | 'eligibleCount' | 'createdAt' | 'status'>) => Promise<{ drive: PlacementDrive; eligibleCount: number }>;
  getStudentsByDataset: (datasetId: string) => Student[];
  getDrivesByDataset: (datasetId: string) => PlacementDrive[];
  getStudentDriveHistory: (studentId: string) => Promise<{ drive: PlacementDrive; eligibilityRecord: EligibilityRecord }[]> | { drive: PlacementDrive; eligibilityRecord: EligibilityRecord }[];
  getEligibleStudentsForDrive: (driveId: string) => Promise<Student[]> | Student[];
  evaluateDriveEligibilityPreview: (datasetId: string, ast: FilterAST) => Promise<Student[]> | Student[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<StudentDataset[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [eligibilityRecords, setEligibilityRecords] = useState<EligibilityRecord[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>('');

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // UI Settings state with LocalStorage persistence
  const [uiSettings, setUiSettings] = useState<UISettings>(() => {
    try {
      const saved = localStorage.getItem('tp_ui_settings');
      return saved ? JSON.parse(saved) : DEFAULT_UI_SETTINGS;
    } catch {
      return DEFAULT_UI_SETTINGS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply UI Settings dynamically to root document and body elements
  useEffect(() => {
    try {
      localStorage.setItem('tp_ui_settings', JSON.stringify(uiSettings));
    } catch (e) {
      console.warn('Could not save UI settings to localStorage', e);
    }

    const root = document.documentElement;

    const fontSizes: Record<string, string> = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    };

    const fontFamilies: Record<string, string> = {
      Inter: "'Inter', system-ui, -apple-system, sans-serif",
      Roboto: "'Roboto', sans-serif",
      Outfit: "'Outfit', sans-serif",
      'Fira Code': "'Fira Code', monospace",
      System: "system-ui, -apple-system, sans-serif",
    };

    const targetFont = fontFamilies[uiSettings.fontFamily] || fontFamilies.Inter;
    root.style.setProperty('--app-font-family', targetFont);
    root.style.setProperty('--app-font-size', fontSizes[uiSettings.fontSize] || '16px');
    root.style.setProperty('--app-text-scale', String(uiSettings.textScale / 100));

    document.body.style.fontFamily = targetFont;

    if (uiSettings.textWrap) {
      root.classList.remove('app-nowrap');
      root.classList.add('app-wrap');
    } else {
      root.classList.remove('app-wrap');
      root.classList.add('app-nowrap');
    }
  }, [uiSettings]);

  // Connect to Backend REST API or Load Static Demo Data
  const refreshData = useCallback(async () => {
    setIsLoading(true);

    if (uiSettings.isDemoMode) {
      // Demo Mode: Load static mock data exclusively
      setDatasets(INITIAL_DATASETS);
      setStudents(INITIAL_STUDENTS);
      setDrives(INITIAL_DRIVES);
      setEligibilityRecords(INITIAL_ELIGIBILITY_RECORDS);
      setActiveDatasetId((prev) => {
        if (prev && INITIAL_DATASETS.some((d) => d.id === prev)) return prev;
        return INITIAL_DATASETS[0]?.id || '';
      });
      setIsLoading(false);
      return;
    }

    // Backend API Mode: CLEAR ALL STATIC MOCK DATA FIRST
    setDatasets([]);
    setStudents([]);
    setDrives([]);
    setEligibilityRecords([]);

    const isOnline = await checkBackendHealth();
    setIsBackendConnected(isOnline);

    if (isOnline) {
      try {
        const [apiDs, apiDrs] = await Promise.all([
          apiFetchDatasets(),
          apiFetchDrives(),
        ]);

        if (apiDs.length > 0) {
          setDatasets(apiDs);
          let targetId = apiDs[0].id;
          setActiveDatasetId((prev) => {
            const currentValid = apiDs.find((d) => d.id === prev);
            if (currentValid) {
              targetId = currentValid.id;
              return currentValid.id;
            }
            return apiDs[0].id;
          });

          const apiStds = await apiFetchStudents(targetId);
          setStudents(apiStds);
        } else {
          setDatasets([]);
          setStudents([]);
          setActiveDatasetId('');
        }

        setDrives(apiDrs);
      } catch (err) {
        console.warn('Backend API sync error:', err);
        setDatasets([]);
        setStudents([]);
        setDrives([]);
      }
    } else {
      // Offline in API Mode: Keep arrays empty, do NOT fallback to static demo data
      setDatasets([]);
      setStudents([]);
      setDrives([]);
      setEligibilityRecords([]);
      setActiveDatasetId('');
    }

    setIsLoading(false);
  }, [uiSettings.isDemoMode]);

  useEffect(() => {
    refreshData();
  }, [refreshData, uiSettings.isDemoMode]);

  // Fetch dataset students when active dataset changes in Backend Mode
  useEffect(() => {
    if (!uiSettings.isDemoMode && isBackendConnected && activeDatasetId) {
      apiFetchStudents(activeDatasetId)
        .then((stdList) => setStudents(stdList))
        .catch((err) => {
          console.warn('Students fetch error:', err);
          setStudents([]);
        });
    }
  }, [activeDatasetId, isBackendConnected, uiSettings.isDemoMode]);

  const updateUISettings = (updates: Partial<UISettings>) => {
    setUiSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetUISettings = () => {
    setUiSettings(DEFAULT_UI_SETTINGS);
  };

  const activeDataset = datasets.find((d) => d.id === activeDatasetId);

  const getStudentsByDataset = useCallback(
    (datasetId: string) => {
      return students.filter((s) => s.datasetId === datasetId);
    },
    [students]
  );

  const getDrivesByDataset = useCallback(
    (datasetId: string) => {
      return drives.filter((d) => d.datasetId === datasetId);
    },
    [drives]
  );

  const evaluateDriveEligibilityPreview = useCallback(
    async (datasetId: string, ast: FilterAST): Promise<Student[]> => {
      if (!uiSettings.isDemoMode && isBackendConnected) {
        try {
          return await apiPreviewEligibility(datasetId, ast);
        } catch (err) {
          console.warn('API eligibility preview error:', err);
          return [];
        }
      }
      const datasetStudents = getStudentsByDataset(datasetId);
      return filterStudents(datasetStudents, ast);
    },
    [uiSettings.isDemoMode, isBackendConnected, getStudentsByDataset]
  );

  const addDatasetWithStudents = async (
    datasetName: string,
    academicYear: string,
    parsedStudents: Omit<Student, 'id' | 'datasetId'>[]
  ): Promise<StudentDataset> => {
    if (!uiSettings.isDemoMode && isBackendConnected) {
      const createdDs = await apiConfirmDatasetImport(datasetName, academicYear, parsedStudents);
      await refreshData();
      return createdDs;
    } else {
      const newDsId = `ds-${Date.now()}`;
      const newDs: StudentDataset = {
        id: newDsId,
        name: datasetName,
        academicYear,
        totalStudents: parsedStudents.length,
        status: 'Active',
        createdAt: new Date().toISOString(),
        uploadedBy: 'T&P Officer',
      };

      const newStudents: Student[] = parsedStudents.map((s, idx) => ({
        ...s,
        id: `std-${Date.now()}-${idx}`,
        datasetId: newDsId,
      }));

      setDatasets((prev) => [newDs, ...prev]);
      setStudents((prev) => [...newStudents, ...prev]);
      setActiveDatasetId(newDsId);
      return newDs;
    }
  };

  const createPlacementDrive = async (
    driveData: Omit<PlacementDrive, 'id' | 'eligibleCount' | 'createdAt' | 'status'>
  ) => {
    if (!uiSettings.isDemoMode && isBackendConnected) {
      const result = await apiCreateDrive(driveData);
      await refreshData();
      return result;
    } else {
      const datasetStudents = getStudentsByDataset(driveData.datasetId);
      const eligible = filterStudents(datasetStudents, driveData.filterSnapshot);

      const newDriveId = `drv-${Date.now()}`;
      const newDrive: PlacementDrive = {
        ...driveData,
        id: newDriveId,
        status: 'Saved',
        eligibleCount: eligible.length,
        createdAt: new Date().toISOString(),
      };

      const newRecords: EligibilityRecord[] = eligible.map((s, idx) => ({
        id: `el-${Date.now()}-${idx}`,
        driveId: newDriveId,
        studentId: s.id,
        datasetId: driveData.datasetId,
        calculatedAt: new Date().toISOString(),
      }));

      setDrives((prev) => [newDrive, ...prev]);
      setEligibilityRecords((prev) => [...newRecords, ...prev]);
      return { drive: newDrive, eligibleCount: eligible.length };
    }
  };

  const getStudentDriveHistory = useCallback(
    (studentId: string) => {
      if (!uiSettings.isDemoMode && isBackendConnected) {
        return apiFetchStudentDriveHistory(studentId);
      }
      if (uiSettings.isDemoMode) {
        const studentRecords = eligibilityRecords.filter((er) => er.studentId === studentId);
        return studentRecords
          .map((er) => {
            const drive = drives.find((d) => d.id === er.driveId);
            return drive ? { drive, eligibilityRecord: er } : null;
          })
          .filter((item): item is { drive: PlacementDrive; eligibilityRecord: EligibilityRecord } => item !== null);
      }
      return [];
    },
    [uiSettings.isDemoMode, isBackendConnected, eligibilityRecords, drives]
  );

  const getEligibleStudentsForDrive = useCallback(
    (driveId: string) => {
      if (!uiSettings.isDemoMode && isBackendConnected) {
        return apiFetchEligibleStudentsForDrive(driveId);
      }
      if (uiSettings.isDemoMode) {
        const driveRecords = eligibilityRecords.filter((er) => er.driveId === driveId);
        const eligibleStudentIds = new Set(driveRecords.map((er) => er.studentId));
        return students.filter((s) => eligibleStudentIds.has(s.id));
      }
      return [];
    },
    [uiSettings.isDemoMode, isBackendConnected, eligibilityRecords, students]
  );

  return (
    <AppContext.Provider
      value={{
        datasets,
        students,
        drives,
        eligibilityRecords,
        activeDatasetId,
        setActiveDatasetId,
        activeDataset,
        uiSettings,
        updateUISettings,
        resetUISettings,
        isSettingsOpen,
        setIsSettingsOpen,
        isBackendConnected,
        isLoading,
        addDatasetWithStudents,
        createPlacementDrive,
        getStudentsByDataset,
        getDrivesByDataset,
        getStudentDriveHistory,
        getEligibleStudentsForDrive,
        evaluateDriveEligibilityPreview,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
