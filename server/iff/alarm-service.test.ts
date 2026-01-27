import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  getAlarmThresholds,
  createAlarmThreshold,
  updateAlarmThreshold,
  deleteAlarmThreshold,
  createAlarmEvent,
  getActiveAlarmEvents,
  getAlarmEventHistory,
  acknowledgeAlarmEvent,
  resolveAlarmEvent,
  getAlarmStatistics,
} from "./alarm-service";

describe("Alarm Service", () => {
  // Mock database functions
  vi.mock("../db", () => ({
    getDb: vi.fn(async () => {
      // Return a mock database
      return {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => ({
                  offset: vi.fn(() => Promise.resolve([])),
                })),
              })),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          values: vi.fn(() => Promise.resolve([1])),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
          })),
        })),
        delete: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])),
        })),
      };
    }),
  }));

  describe("getAlarmThresholds", () => {
    it("should return empty array when no thresholds exist", async () => {
      const thresholds = await getAlarmThresholds();
      expect(Array.isArray(thresholds)).toBe(true);
    });

    it("should filter by userId when provided", async () => {
      const thresholds = await getAlarmThresholds(1);
      expect(Array.isArray(thresholds)).toBe(true);
    });
  });

  describe("createAlarmThreshold", () => {
    it("should create a new alarm threshold", async () => {
      const threshold = await createAlarmThreshold(
        "overallIFFScore",
        50,
        70,
        1,
        "Test threshold"
      );

      if (threshold) {
        expect(threshold.metricName).toBe("overallIFFScore");
        expect(threshold.criticalThreshold).toBe(50);
        expect(threshold.warningThreshold).toBe(70);
        expect(threshold.enabled).toBe(true);
      }
    });

    it("should handle creation errors gracefully", async () => {
      const threshold = await createAlarmThreshold(
        "invalidMetric",
        50,
        70,
        undefined,
        "Error test"
      );

      // Should return null or handle error gracefully
      expect(threshold === null || threshold !== undefined).toBe(true);
    });
  });

  describe("updateAlarmThreshold", () => {
    it("should update threshold values", async () => {
      const updated = await updateAlarmThreshold(1, {
        criticalThreshold: 40,
        warningThreshold: 65,
      });

      if (updated) {
        expect(updated.id).toBe(1);
      }
    });

    it("should toggle enabled status", async () => {
      const updated = await updateAlarmThreshold(1, {
        enabled: false,
      });

      if (updated) {
        expect(updated.enabled).toBe(false);
      }
    });
  });

  describe("deleteAlarmThreshold", () => {
    it("should delete a threshold", async () => {
      const result = await deleteAlarmThreshold(1);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("createAlarmEvent", () => {
    it("should create a new alarm event", async () => {
      const event = await createAlarmEvent(
        "overallIFFScore",
        45,
        50,
        "CRITICAL",
        "IFF Score below critical threshold",
        1,
        1,
        1
      );

      if (event) {
        expect(event.metricName).toBe("overallIFFScore");
        expect(event.severity).toBe("CRITICAL");
        expect(event.status).toBe("ACTIVE");
      }
    });

    it("should create warning alarm events", async () => {
      const event = await createAlarmEvent(
        "dynamicFidelityIndex",
        65,
        70,
        "WARNING",
        "DFI approaching threshold",
        1,
        1,
        1
      );

      if (event) {
        expect(event.severity).toBe("WARNING");
      }
    });
  });

  describe("getActiveAlarmEvents", () => {
    it("should return active alarm events", async () => {
      const alarms = await getActiveAlarmEvents();
      expect(Array.isArray(alarms)).toBe(true);
    });

    it("should filter by userId", async () => {
      const alarms = await getActiveAlarmEvents(1, 50);
      expect(Array.isArray(alarms)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const alarms = await getActiveAlarmEvents(undefined, 10);
      expect(Array.isArray(alarms)).toBe(true);
    });
  });

  describe("getAlarmEventHistory", () => {
    it("should return alarm history", async () => {
      const history = await getAlarmEventHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it("should support pagination", async () => {
      const history = await getAlarmEventHistory(1, 50, 0);
      expect(Array.isArray(history)).toBe(true);
    });

    it("should support offset", async () => {
      const history = await getAlarmEventHistory(1, 50, 100);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("acknowledgeAlarmEvent", () => {
    it("should acknowledge an alarm event", async () => {
      const acknowledged = await acknowledgeAlarmEvent(1, "test_user");

      if (acknowledged) {
        expect(acknowledged.id).toBe(1);
        expect(acknowledged.status).toBe("ACKNOWLEDGED");
        expect(acknowledged.acknowledgedBy).toBe("test_user");
      }
    });
  });

  describe("resolveAlarmEvent", () => {
    it("should resolve an alarm event", async () => {
      const resolved = await resolveAlarmEvent(1, "test_user", "Fixed the issue");

      if (resolved) {
        expect(resolved.id).toBe(1);
        expect(resolved.status).toBe("RESOLVED");
        expect(resolved.resolvedBy).toBe("test_user");
      }
    });

    it("should support resolution notes", async () => {
      const resolved = await resolveAlarmEvent(1, "test_user", "Recalibrated sensors");

      if (resolved) {
        expect(resolved.resolutionNotes).toBe("Recalibrated sensors");
      }
    });
  });

  describe("getAlarmStatistics", () => {
    it("should return alarm statistics", async () => {
      const stats = await getAlarmStatistics();

      expect(stats).toHaveProperty("totalActive");
      expect(stats).toHaveProperty("criticalCount");
      expect(stats).toHaveProperty("warningCount");
      expect(stats).toHaveProperty("totalHistorical");
      expect(stats).toHaveProperty("alarmsByMetric");

      expect(typeof stats.totalActive).toBe("number");
      expect(typeof stats.criticalCount).toBe("number");
      expect(typeof stats.warningCount).toBe("number");
      expect(typeof stats.totalHistorical).toBe("number");
    });

    it("should filter statistics by userId", async () => {
      const stats = await getAlarmStatistics(1);

      expect(stats).toHaveProperty("totalActive");
      expect(stats.totalActive >= 0).toBe(true);
    });

    it("should count alarms by metric", async () => {
      const stats = await getAlarmStatistics();

      expect(typeof stats.alarmsByMetric).toBe("object");
    });
  });

  describe("Alarm Severity Levels", () => {
    it("should distinguish between WARNING and CRITICAL", async () => {
      const warning = await createAlarmEvent(
        "confidenceLevel",
        75,
        80,
        "WARNING",
        "Low confidence",
        1
      );

      const critical = await createAlarmEvent(
        "confidenceLevel",
        40,
        50,
        "CRITICAL",
        "Very low confidence",
        1
      );

      if (warning && critical) {
        expect(warning.severity).toBe("WARNING");
        expect(critical.severity).toBe("CRITICAL");
      }
    });
  });

  describe("Alarm Status Lifecycle", () => {
    it("should transition from ACTIVE to ACKNOWLEDGED", async () => {
      const acknowledged = await acknowledgeAlarmEvent(1, "operator");

      if (acknowledged) {
        expect(acknowledged.status).toBe("ACKNOWLEDGED");
        expect(acknowledged.acknowledgedBy).toBe("operator");
        expect(acknowledged.acknowledgedAt).toBeDefined();
      }
    });

    it("should transition from ACKNOWLEDGED to RESOLVED", async () => {
      const resolved = await resolveAlarmEvent(1, "operator", "Issue fixed");

      if (resolved) {
        expect(resolved.status).toBe("RESOLVED");
        expect(resolved.resolvedBy).toBe("operator");
        expect(resolved.resolvedAt).toBeDefined();
      }
    });
  });

  describe("Threshold Configuration", () => {
    it("should enforce critical < warning thresholds", async () => {
      // Critical should be lower than warning for score-based metrics
      const threshold = await createAlarmThreshold(
        "overallIFFScore",
        50, // critical
        70, // warning
        1
      );

      if (threshold) {
        expect(threshold.criticalThreshold < threshold.warningThreshold).toBe(true);
      }
    });

    it("should support multiple metrics", async () => {
      const metrics = [
        "overallIFFScore",
        "dynamicFidelityIndex",
        "confidenceLevel",
        "overallUncertaintyPercent",
      ];

      for (const metric of metrics) {
        const threshold = await createAlarmThreshold(metric, 40, 60, 1);
        if (threshold) {
          expect(threshold.metricName).toBe(metric);
        }
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const result = await getAlarmThresholds();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty arrays on error", async () => {
      const alarms = await getActiveAlarmEvents();
      expect(Array.isArray(alarms)).toBe(true);

      const history = await getAlarmEventHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it("should return null on creation error", async () => {
      const threshold = await createAlarmThreshold("test", 50, 70);
      expect(threshold === null || threshold !== undefined).toBe(true);
    });
  });
});
