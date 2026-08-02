export type MilkSession = "morning" | "evening";

export type HealthCondition =
  | "healthy"
  | "under_observation"
  | "sick"
  | "recovering";

export interface StaffActor {
  userId: string;
  name: string;
}

export interface MilkRecordDoc {
  id: string;
  cowId: string;
  cowName: string;
  litres: number;
  session: MilkSession;
  recordedByUserId: string;
  recordedByName: string;
  notes: string;
  recordedAt: string;
  createdAt: string;
}

export interface HealthRecordDoc {
  id: string;
  cowId: string;
  cowName: string;
  condition: HealthCondition;
  temperatureC: number | null;
  symptoms: string;
  treatment: string;
  medicineGiven: string;
  recordedByUserId: string;
  recordedByName: string;
  notes: string;
  recordedAt: string;
  createdAt: string;
}

export interface FeedRecordDoc {
  id: string;
  cowId: string;
  cowName: string;
  feedType: string;
  quantityKg: number;
  recordedByUserId: string;
  recordedByName: string;
  notes: string;
  recordedAt: string;
  createdAt: string;
}

export interface VaccinationRecordDoc {
  id: string;
  cowId: string;
  cowName: string;
  vaccineName: string;
  dose: string;
  nextDueAt: string | null;
  recordedByUserId: string;
  recordedByName: string;
  notes: string;
  recordedAt: string;
  createdAt: string;
}

export interface DailyReportDoc {
  id: string;
  reportDate: string;
  summary: string;
  cowsChecked: number;
  milkTotalLitres: number;
  issues: string;
  recordedByUserId: string;
  recordedByName: string;
  createdAt: string;
}

export interface FarmStats {
  cows: number;
  milkTodayLitres: number;
  milkRecordsToday: number;
  healthUpdatesToday: number;
  feedRecordsToday: number;
  vaccinationsToday: number;
  reportsToday: number;
}
