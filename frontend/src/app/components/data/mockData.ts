export const summaryCards = [
  {
    id: "total-employees",
    label: "Total Employees",
    value: "1,284",
    change: "+12 this month",
    trend: "up",
    icon: "users",
    color: "blue",
  },
  {
    id: "high-risk",
    label: "High Risk of Resignation",
    value: "47",
    change: "+5 from last week",
    trend: "up",
    icon: "alert-triangle",
    color: "red",
  },
  {
    id: "avg-mood",
    label: "Average Daily Mood",
    value: "6.8 / 10",
    change: "-0.3 from yesterday",
    trend: "down",
    icon: "smile",
    color: "amber",
  },
];

export const resignationTrends = [
  { month: "Jan", resignations: 8, predicted: 9 },
  { month: "Feb", resignations: 12, predicted: 11 },
  { month: "Mar", resignations: 7, predicted: 10 },
  { month: "Apr", resignations: 15, predicted: 13 },
  { month: "May", resignations: 11, predicted: 14 },
  { month: "Jun", resignations: 18, predicted: 16 },
  { month: "Jul", resignations: 14, predicted: 17 },
  { month: "Aug", resignations: 21, predicted: 20 },
  { month: "Sep", resignations: 19, predicted: 22 },
  { month: "Oct", resignations: 24, predicted: 23 },
  { month: "Nov", resignations: 20, predicted: 25 },
  { month: "Dec", resignations: 28, predicted: 27 },
];

export type RiskLevel = "High" | "Medium" | "Low";

export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  moodScore: number;
  riskLevel: RiskLevel;
  avatar: string;
}

export const highRiskEmployees: Employee[] = [
  { id: 1, name: "Sarah Mitchell", role: "Senior Engineer", department: "Engineering", moodScore: 3.2, riskLevel: "High", avatar: "SM" },
  { id: 2, name: "James Okafor", role: "Product Manager", department: "Product", moodScore: 4.1, riskLevel: "High", avatar: "JO" },
  { id: 3, name: "Priya Nair", role: "UX Designer", department: "Design", moodScore: 4.8, riskLevel: "Medium", avatar: "PN" },
  { id: 4, name: "Carlos Rivera", role: "Data Analyst", department: "Analytics", moodScore: 3.7, riskLevel: "High", avatar: "CR" },
  { id: 5, name: "Emily Chen", role: "Marketing Lead", department: "Marketing", moodScore: 5.1, riskLevel: "Medium", avatar: "EC" },
  { id: 6, name: "Tobias Müller", role: "DevOps Engineer", department: "Engineering", moodScore: 3.0, riskLevel: "High", avatar: "TM" },
  { id: 7, name: "Aisha Patel", role: "HR Specialist", department: "Human Resources", moodScore: 5.9, riskLevel: "Medium", avatar: "AP" },
  { id: 8, name: "Daniel Brooks", role: "Sales Executive", department: "Sales", moodScore: 2.8, riskLevel: "High", avatar: "DB" },
];

export const allEmployees: Employee[] = [
  ...highRiskEmployees,
  { id: 9, name: "Nora Andersen", role: "Frontend Developer", department: "Engineering", moodScore: 7.4, riskLevel: "Low", avatar: "NA" },
  { id: 10, name: "Kenji Tanaka", role: "Backend Developer", department: "Engineering", moodScore: 8.1, riskLevel: "Low", avatar: "KT" },
  { id: 11, name: "Maya Johnson", role: "Content Strategist", department: "Marketing", moodScore: 7.9, riskLevel: "Low", avatar: "MJ" },
  { id: 12, name: "Luca Ferrari", role: "Finance Analyst", department: "Finance", moodScore: 6.5, riskLevel: "Medium", avatar: "LF" },
];
