import { useCallback, useEffect, useState } from "react";
import openingLines, { type OpeningLine } from "@/data/openingLines";
import { buildOpeningCourses } from "@/lib/openings/openingCourseBuilder";

type LineStatus = "new" | "completed";

interface LineProgress {
  status: LineStatus;
  wrongAttempts: number;
  lastReviewed: number | null;
}

const STORAGE_KEY = "opening-progress";

function loadAll(): Record<string, LineProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, LineProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useOpeningProgress() {
  const [progress, setProgress] = useState<Record<string, LineProgress>>({});

  useEffect(() => {
    setProgress(loadAll());
  }, []);

  const getLine = useCallback(
    (id: string): LineProgress => {
      return (
        progress[id] ?? { status: "new", wrongAttempts: 0, lastReviewed: null }
      );
    },
    [progress],
  );

  const markCompleted = useCallback((id: string, wrongCount: number) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        [id]: {
          status: "completed" as const,
          wrongAttempts: wrongCount,
          lastReviewed: Date.now(),
        },
      };
      saveAll(next);
      return next;
    });
  }, []);

  const lines = openingLines;
  const totalLines = lines.length;

  const newCount = lines.filter((l) => getLine(l.id).status === "new").length;

  const completedCount = lines.filter(
    (l) => getLine(l.id).status === "completed",
  ).length;

  const courses = buildOpeningCourses(lines);

  const getCourseProgress = useCallback(
    (courseId: string) => {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return { total: 0, completed: 0, newCount: 0 };
      const all = [course.mainLine, ...course.variations.map((v) => v.line)];
      const completed = all.filter(
        (l) => getLine(l.id).status === "completed",
      ).length;
      const newCount = all.filter((l) => getLine(l.id).status === "new").length;
      return { total: all.length, completed, newCount };
    },
    [courses, getLine],
  );

  const getNextNewVariation = useCallback(
    (courseId: string): OpeningLine | null => {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return null;
      if (getLine(course.mainLine.id).status === "new") return course.mainLine;
      for (const v of course.variations) {
        if (getLine(v.line.id).status === "new") return v.line;
      }
      return null;
    },
    [courses, getLine],
  );

  return {
    lines,
    totalLines,
    newCount,
    completedCount,
    courses,
    getLine,
    getCourseProgress,
    getNextNewVariation,
    markCompleted,
  };
}
