export const TIMETABLE: Record<number, { lectures: string[], labs: string[] }> = {
  // MONDAY (Day 1)
  1: { 
    lectures: ["MDM-I Theory (2:15-3:15)", "MDM-I Theory (2:15-3:15)"],
    labs: ["MDM-I LAB (9:00-10:00)", "MDM-I LAB (10:00-11:00)", "OS/DAA/CCN/PCS (11:15-1:15 - Batch Assigned)", "MDM-I LAB (3:15-4:15)"] 
  },
  // TUESDAY (Day 2)
  2: { 
    lectures: ["OS (KKD, Room 002) (9:00-10:00)", "CCN (JS, Room 002) (10:00-11:00)", "MDM-I Theory (2:15-3:15)"],
    labs: ["MDM-I LAB (10:00-11:00)", "PCS/OS/DAA/CCN (11:15-1:15 - Batch Assigned)", "MDM-I LAB (3:15-4:15)"] 
  },
  // WEDNESDAY (Day 3)
  3: { 
    lectures: ["DAA (AVN, Room 002) (9:00-10:00)", "OS (KKD, Room 002) (10:00-11:00)", "FOM-II (AST, 307) (2:15-3:15)", "SMCS (AT, 508) (2:15-3:15)", "HSS (3:15-4:15)", "LLC (4:15-5:15)"],
    labs: ["CCN/PCS/OS/DAA (11:15-1:15 - Batch Assigned)"] 
  },
  // THURSDAY (Day 4)
  4: { 
    lectures: ["PCS (DN, Room 002) (9:00-10:00)", "DAA (AVN, Room 002) (10:00-11:00)", "OS (KKD, Room 002) (11:15-1:15 - All Batches)", "FOM-II (AST, 307) (2:15-3:15)", "SMCS (AT, 002) (2:15-3:15)", "HSS (3:15-4:15)", "LLC (4:15-5:15)"],
    labs: ["OS (KKD, Room 002) (11:15-1:15 - All Batches)"] 
  },
  // FRIDAY (Day 5)
  5: { 
    lectures: ["FOM-II (AST, 307) (10:00-11:00)", "SMCS (AT, 002) (10:00-11:00)", "STUDENT ACTIVITY (5:15-6:15)"],
    labs: ["CCN (JS, Room 002) (11:15-1:15)", "DAA (AVN, Room 002) (11:15-1:15)", "Batch Practical: DAA/CCN/PCS/OS (2:15-3:15)"] 
  },
  // SATURDAY (Day 6) - No classes
  6: { lectures: [], labs: [] },
  // SUNDAY (Day 0) - No classes
  0: { lectures: [], labs: [] },
};

export const ONLINE_CLASSES = [
  "LAW-II: Online (Monday to Sunday, 6:00-8:00 PM)",
  "GERMAN-II: Online (Thursday & Friday, 6:00-8:00 PM)",
  "MDM-SPJIMR: Wednesday & Friday at 4:30 PM"
];

export const calculateMissedWork = (dates: string[]) => {
  const missedLectures = new Set<string>();
  const missedLabs = new Set<string>();
  dates.forEach(dateStr => {
    const dayOfWeek = new Date(dateStr).getDay();
    const daySchedule = TIMETABLE[dayOfWeek];
    if (daySchedule) {
      daySchedule.lectures.forEach(l => missedLectures.add(l));
      daySchedule.labs.forEach(l => missedLabs.add(l));
    }
  });
  return {
    lectures: Array.from(missedLectures).join(", "),
    labs: Array.from(missedLabs).join(", ")
  };
};

// Assignments Database
export interface Assignment {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed" | "submitted" | "graded";
  professor: string;
  marks?: number;
  maxMarks?: number;
}

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    subject: "MDM-I",
    title: "Assignment 1: Matrix Operations",
    description: "Solve 15 matrix multiplication and transformation problems",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(), // 3 days from now
    status: "pending",
    professor: "Dr. Kumar",
  },
  {
    id: "2",
    subject: "DAA",
    title: "Algorithm Implementation: Quicksort",
    description: "Implement and analyze the performance of Quicksort algorithm with comparative study",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString(), // 7 days from now
    status: "pending",
    professor: "Prof. Verma",
  },
  {
    id: "3",
    subject: "OS",
    title: "Process Scheduling Simulation",
    description: "Simulate different CPU scheduling algorithms (FCFS, SJF, Round Robin)",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString(), // 5 days from now
    status: "pending",
    professor: "Dr. Sharma",
  },
  {
    id: "4",
    subject: "CCN",
    title: "Network Protocol Analysis",
    description: "Analyze and document the OSI model with practical examples",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toDateString(), // 10 days from now
    status: "pending",
    professor: "Prof. Singh",
  },
  {
    id: "5",
    subject: "FOM-II",
    title: "Financial Analysis Report",
    description: "Create a comprehensive financial analysis of a tech company",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toDateString(), // 2 days ago (overdue)
    status: "pending",
    professor: "Dr. Patel",
  },
];

export const getPendingAssignments = (): Assignment[] => {
  return ASSIGNMENTS.filter(a => a.status === "pending" || a.status === "submitted");
};

export const getOverdueAssignments = (): Assignment[] => {
  const now = new Date();
  return ASSIGNMENTS.filter(a => {
    const dueDate = new Date(a.dueDate);
    return (a.status === "pending" || a.status === "submitted") && dueDate < now;
  });
};

export const getUpcomingAssignments = (daysAhead: number = 7): Assignment[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return ASSIGNMENTS.filter(a => {
    const dueDate = new Date(a.dueDate);
    return (a.status === "pending" || a.status === "submitted") && dueDate > now && dueDate <= futureDate;
  });
};
