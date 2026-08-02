import { v4 as uuid } from "uuid";
import { Cow } from "../../models/Cow.js";
import { AppError } from "../../shared/errors/AppError.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import { cowRepository } from "../adoptions/cow.repository.js";
import type { CowDoc } from "../adoptions/adoption.types.js";
import { farmRepository } from "./farm.repository.js";
import type {
  DailyReportDoc,
  FarmStats,
  FeedRecordDoc,
  HealthRecordDoc,
  MilkRecordDoc,
  StaffActor,
  VaccinationRecordDoc,
} from "./farm.types.js";

async function requireCow(cowId: string): Promise<CowDoc> {
  const cow = await cowRepository.findById(cowId);
  if (!cow) throw new AppError("Cow not found", 404);
  return cow;
}

function nowIso(override?: string): string {
  return override ?? new Date().toISOString();
}

export const farmService = {
  listCows() {
    return cowRepository.findAll();
  },

  async updateCow(
    id: string,
    input: Partial<Pick<CowDoc, "status" | "milkYieldLabel" | "availableForAdoption" | "description">>,
  ) {
    if (Object.keys(input).length === 0) {
      throw new AppError("No cow fields to update", 400);
    }
    const updated = await cowRepository.update(id, input);
    if (!updated) throw new AppError("Cow not found", 404);
    return updated;
  },

  async stats(): Promise<FarmStats> {
    const [cows, today] = await Promise.all([
      Cow.countDocuments().maxTimeMS(QUERY_MAX_MS),
      farmRepository.statsToday(),
    ]);
    return { cows, ...today };
  },

  async recordMilk(
    input: {
      cowId: string;
      litres: number;
      session: MilkRecordDoc["session"];
      notes?: string;
      recordedAt?: string;
    },
    actor: StaffActor,
  ): Promise<MilkRecordDoc> {
    const cow = await requireCow(input.cowId);
    const row: MilkRecordDoc = {
      id: uuid(),
      cowId: cow.id,
      cowName: cow.name,
      litres: input.litres,
      session: input.session,
      recordedByUserId: actor.userId,
      recordedByName: actor.name,
      notes: input.notes ?? "",
      recordedAt: nowIso(input.recordedAt),
      createdAt: new Date().toISOString(),
    };
    return farmRepository.createMilk(row);
  },

  listMilk() {
    return farmRepository.listMilk();
  },

  async recordHealth(
    input: {
      cowId: string;
      condition: HealthRecordDoc["condition"];
      temperatureC?: number | null;
      symptoms?: string;
      treatment?: string;
      medicineGiven?: string;
      notes?: string;
      recordedAt?: string;
    },
    actor: StaffActor,
  ): Promise<HealthRecordDoc> {
    const cow = await requireCow(input.cowId);
    const row: HealthRecordDoc = {
      id: uuid(),
      cowId: cow.id,
      cowName: cow.name,
      condition: input.condition,
      temperatureC: input.temperatureC ?? null,
      symptoms: input.symptoms ?? "",
      treatment: input.treatment ?? "",
      medicineGiven: input.medicineGiven ?? "",
      recordedByUserId: actor.userId,
      recordedByName: actor.name,
      notes: input.notes ?? "",
      recordedAt: nowIso(input.recordedAt),
      createdAt: new Date().toISOString(),
    };
    const created = await farmRepository.createHealth(row);

    const statusMap: Record<HealthRecordDoc["condition"], CowDoc["status"]> = {
      healthy: "healthy",
      under_observation: "under_care",
      sick: "under_care",
      recovering: "under_care",
    };
    await cowRepository.update(cow.id, { status: statusMap[input.condition] });

    return created;
  },

  listHealth() {
    return farmRepository.listHealth();
  },

  async recordFeed(
    input: {
      cowId: string;
      feedType: string;
      quantityKg: number;
      notes?: string;
      recordedAt?: string;
    },
    actor: StaffActor,
  ): Promise<FeedRecordDoc> {
    const cow = await requireCow(input.cowId);
    const row: FeedRecordDoc = {
      id: uuid(),
      cowId: cow.id,
      cowName: cow.name,
      feedType: input.feedType,
      quantityKg: input.quantityKg,
      recordedByUserId: actor.userId,
      recordedByName: actor.name,
      notes: input.notes ?? "",
      recordedAt: nowIso(input.recordedAt),
      createdAt: new Date().toISOString(),
    };
    return farmRepository.createFeed(row);
  },

  listFeed() {
    return farmRepository.listFeed();
  },

  async recordVaccination(
    input: {
      cowId: string;
      vaccineName: string;
      dose?: string;
      nextDueAt?: string | null;
      notes?: string;
      recordedAt?: string;
    },
    actor: StaffActor,
  ): Promise<VaccinationRecordDoc> {
    const cow = await requireCow(input.cowId);
    const row: VaccinationRecordDoc = {
      id: uuid(),
      cowId: cow.id,
      cowName: cow.name,
      vaccineName: input.vaccineName,
      dose: input.dose ?? "",
      nextDueAt: input.nextDueAt ?? null,
      recordedByUserId: actor.userId,
      recordedByName: actor.name,
      notes: input.notes ?? "",
      recordedAt: nowIso(input.recordedAt),
      createdAt: new Date().toISOString(),
    };
    return farmRepository.createVaccination(row);
  },

  listVaccinations() {
    return farmRepository.listVaccinations();
  },

  async submitDailyReport(
    input: {
      reportDate: string;
      summary: string;
      cowsChecked: number;
      milkTotalLitres: number;
      issues?: string;
    },
    actor: StaffActor,
  ): Promise<DailyReportDoc> {
    const row: DailyReportDoc = {
      id: uuid(),
      reportDate: input.reportDate,
      summary: input.summary,
      cowsChecked: input.cowsChecked,
      milkTotalLitres: input.milkTotalLitres,
      issues: input.issues ?? "",
      recordedByUserId: actor.userId,
      recordedByName: actor.name,
      createdAt: new Date().toISOString(),
    };
    try {
      return await farmRepository.createDailyReport(row);
    } catch (err) {
      const code = (err as { code?: number }).code;
      if (code === 11000) {
        throw new AppError("You already submitted a daily report for this date", 409);
      }
      throw err;
    }
  },

  listDailyReports() {
    return farmRepository.listDailyReports();
  },
};
