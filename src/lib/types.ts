export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type StudyRecord = {
  id: string;
  title: string;
  content: string | null;
  duration: number;
  date: string;
  categoryId: string | null;
  category: Category | null;
  tags: { tag: Tag }[];
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  title: string;
  targetHours: number;
  period: "weekly" | "monthly";
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
};

export type Stats = {
  totalRecords: number;
  weekHours: number;
  monthHours: number;
  dailyData: { date: string; minutes: number; hours: number }[];
  categoryData: { name: string; color: string; minutes: number }[];
};
