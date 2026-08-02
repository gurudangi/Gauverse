import { MilkRecord } from "../../models/MilkRecord.js";
import { HealthRecord } from "../../models/HealthRecord.js";
import { FeedRecord } from "../../models/FeedRecord.js";
import { VaccinationRecord } from "../../models/VaccinationRecord.js";
import { DailyReport } from "../../models/DailyReport.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type {
  DailyReportDoc,
  FeedRecordDoc,
  HealthRecordDoc,
  MilkRecordDoc,
  VaccinationRecordDoc,
} from "./farm.types.js";

function toIso(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const farmRepository = {
  async createMilk(row: MilkRecordDoc): Promise<MilkRecordDoc> {
    await MilkRecord.create({
      ...row,
      recordedAt: new Date(row.recordedAt),
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async listMilk(limit = 50): Promise<MilkRecordDoc[]> {
    const rows = await MilkRecord.find()
      .sort({ recordedAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => ({
      id: r.id,
      cowId: r.cowId,
      cowName: r.cowName,
      litres: r.litres,
      session: r.session as MilkRecordDoc["session"],
      recordedByUserId: r.recordedByUserId,
      recordedByName: r.recordedByName,
      notes: r.notes ?? "",
      recordedAt: toIso(r.recordedAt)!,
      createdAt: toIso(r.createdAt)!,
    }));
  },

  async createHealth(row: HealthRecordDoc): Promise<HealthRecordDoc> {
    await HealthRecord.create({
      ...row,
      recordedAt: new Date(row.recordedAt),
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async listHealth(limit = 50): Promise<HealthRecordDoc[]> {
    const rows = await HealthRecord.find()
      .sort({ recordedAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => ({
      id: r.id,
      cowId: r.cowId,
      cowName: r.cowName,
      condition: r.condition as HealthRecordDoc["condition"],
      temperatureC: r.temperatureC ?? null,
      symptoms: r.symptoms ?? "",
      treatment: r.treatment ?? "",
      medicineGiven: r.medicineGiven ?? "",
      recordedByUserId: r.recordedByUserId,
      recordedByName: r.recordedByName,
      notes: r.notes ?? "",
      recordedAt: toIso(r.recordedAt)!,
      createdAt: toIso(r.createdAt)!,
    }));
  },

  async createFeed(row: FeedRecordDoc): Promise<FeedRecordDoc> {
    await FeedRecord.create({
      ...row,
      recordedAt: new Date(row.recordedAt),
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async listFeed(limit = 50): Promise<FeedRecordDoc[]> {
    const rows = await FeedRecord.find()
      .sort({ recordedAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => ({
      id: r.id,
      cowId: r.cowId,
      cowName: r.cowName,
      feedType: r.feedType,
      quantityKg: r.quantityKg,
      recordedByUserId: r.recordedByUserId,
      recordedByName: r.recordedByName,
      notes: r.notes ?? "",
      recordedAt: toIso(r.recordedAt)!,
      createdAt: toIso(r.createdAt)!,
    }));
  },

  async createVaccination(row: VaccinationRecordDoc): Promise<VaccinationRecordDoc> {
    await VaccinationRecord.create({
      ...row,
      nextDueAt: row.nextDueAt ? new Date(row.nextDueAt) : null,
      recordedAt: new Date(row.recordedAt),
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async listVaccinations(limit = 50): Promise<VaccinationRecordDoc[]> {
    const rows = await VaccinationRecord.find()
      .sort({ recordedAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => ({
      id: r.id,
      cowId: r.cowId,
      cowName: r.cowName,
      vaccineName: r.vaccineName,
      dose: r.dose ?? "",
      nextDueAt: toIso(r.nextDueAt),
      recordedByUserId: r.recordedByUserId,
      recordedByName: r.recordedByName,
      notes: r.notes ?? "",
      recordedAt: toIso(r.recordedAt)!,
      createdAt: toIso(r.createdAt)!,
    }));
  },

  async createDailyReport(row: DailyReportDoc): Promise<DailyReportDoc> {
    await DailyReport.create({
      ...row,
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async listDailyReports(limit = 50): Promise<DailyReportDoc[]> {
    const rows = await DailyReport.find()
      .sort({ reportDate: -1, createdAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => ({
      id: r.id,
      reportDate: r.reportDate,
      summary: r.summary,
      cowsChecked: r.cowsChecked,
      milkTotalLitres: r.milkTotalLitres,
      issues: r.issues ?? "",
      recordedByUserId: r.recordedByUserId,
      recordedByName: r.recordedByName,
      createdAt: toIso(r.createdAt)!,
    }));
  },

  async statsToday() {
    const since = startOfUtcDay();
    const [
      milkAgg,
      milkRecordsToday,
      healthUpdatesToday,
      feedRecordsToday,
      vaccinationsToday,
      reportsToday,
    ] = await Promise.all([
      MilkRecord.aggregate([
        { $match: { recordedAt: { $gte: since } } },
        { $group: { _id: null, total: { $sum: "$litres" } } },
      ]).option({ maxTimeMS: QUERY_MAX_MS }),
      MilkRecord.countDocuments({ recordedAt: { $gte: since } }),
      HealthRecord.countDocuments({ recordedAt: { $gte: since } }),
      FeedRecord.countDocuments({ recordedAt: { $gte: since } }),
      VaccinationRecord.countDocuments({ recordedAt: { $gte: since } }),
      DailyReport.countDocuments({
        reportDate: since.toISOString().slice(0, 10),
      }),
    ]);

    return {
      milkTodayLitres: milkAgg[0]?.total ?? 0,
      milkRecordsToday,
      healthUpdatesToday,
      feedRecordsToday,
      vaccinationsToday,
      reportsToday,
    };
  },
};
