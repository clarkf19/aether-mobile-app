import { jsPDF } from "jspdf";

// Enhanced color scheme for professional styling
const COLORS = {
  primary: { r: 201, g: 160, b: 89 },      // Gold
  secondary: { r: 26, g: 20, b: 13 },      // Dark brown
  accent: { r: 139, g: 109, b: 59 },       // Darker gold
  text: { r: 40, g: 40, b: 40 },           // Dark text
  lightText: { r: 100, g: 100, b: 100 },   // Gray text
  tableHeader: { r: 245, g: 245, b: 245 }, // Light gray for table headers
  tableBorder: { r: 200, g: 200, b: 200 }, // Light border
  white: { r: 255, g: 255, b: 255 },       // White
};

interface PDFDocument {
  type: "letter" | "declaration" | "certificate" | "assignment" | "permission";
  fileName: string;
  data: Record<string, unknown>;
  recipient?: {
    name: string;
    title: string;
    department?: string;
  };
}

export interface AcademicDocument {
  studentName: string;
  studentId: string;
  department: string;
  year: string;
  semester: string;
  dates: string[];
  missedLectures: string[];
  missedLabs: string[];
  reason: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

const addLetterHeader = (doc: jsPDF, institution: string = "SPIT", department: string = "Computer Engineering") => {
  // Gold bar at top
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, 210, 10, "F");

  // Institution name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.text(institution.toUpperCase(), 105, 20, { align: "center" });

  // Department
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(department, 105, 28, { align: "center" });

  // Address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.lightText.r, COLORS.lightText.g, COLORS.lightText.b);
  doc.text("Sardar Patel Institute of Technology, Andheri West, Mumbai - 400058", 105, 35, { align: "center" });

  // Horizontal line
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.8);
  doc.line(15, 40, 195, 40);
};

const addLetterFooter = (doc: jsPDF, pageNum: number = 1) => {
  const pageHeight = doc.internal.pageSize.getHeight();

  // Footer line
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.8);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);

  // Footer text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightText.r, COLORS.lightText.g, COLORS.lightText.b);
  doc.text("This is a system-generated document. For verification, contact the Academic Office.", 105, pageHeight - 15, { align: "center" });

  // Page number
  doc.text(`Page ${pageNum}`, 105, pageHeight - 8, { align: "center" });
};

// Enhanced table drawing function
const drawTable = (doc: jsPDF, startX: number, startY: number, headers: string[], rows: string[][], colWidths: number[]) => {
  const rowHeight = 8;
  const headerHeight = 10;
  let currentY = startY;

  // Draw headers
  doc.setFillColor(COLORS.tableHeader.r, COLORS.tableHeader.g, COLORS.tableHeader.b);
  doc.setDrawColor(COLORS.tableBorder.r, COLORS.tableBorder.g, COLORS.tableBorder.b);

  let currentX = startX;
  for (let i = 0; i < headers.length; i++) {
    // Header background
    doc.rect(currentX, currentY, colWidths[i], headerHeight, "FD");

    // Header text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(headers[i], currentX + 2, currentY + 6);

    currentX += colWidths[i];
  }

  currentY += headerHeight;

  // Draw rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  for (const row of rows) {
    currentX = startX;
    for (let i = 0; i < row.length; i++) {
      // Cell border
      doc.rect(currentX, currentY, colWidths[i], rowHeight);

      // Cell text
      const textLines = doc.splitTextToSize(row[i], colWidths[i] - 4);
      doc.text(textLines, currentX + 2, currentY + 5);

      currentX += colWidths[i];
    }
    currentY += rowHeight;
  }

  return currentY;
};

// Professional signature block
const addSignatureBlock = (doc: jsPDF, yPos: number, title: string, name: string = "") => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  doc.text(title, 15, yPos);
  doc.text("Department of Computer Engineering", 15, yPos + 5);
  doc.text("SPIT, Mumbai", 15, yPos + 10);

  // Signature line
  doc.setDrawColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setLineWidth(0.5);
  doc.line(15, yPos + 20, 80, yPos + 20);

  if (name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(name, 15, yPos + 25);
    doc.text("Authorized Signatory", 15, yPos + 30);
  }

  return yPos + 35;
};

// DOCUMENT 1: Pre-Event Permission Letter (to HOD/Class Coordinator)
export const generatePreEventPermissionLetter = (documentData: AcademicDocument, recipientName: string = "Dr. Sunita Desai", recipientTitle: string = "Class Coordinator") => {
  const doc = new jsPDF();
  
  addLetterHeader(doc);
  
  let yPos = 50;
  
  // Reference and Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const refNumber = `REF: PERM/SE2024001/2026`;
  doc.text(refNumber, 15, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, yPos);
  
  yPos += 15;
  
  // Recipient Address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(recipientName, 15, yPos);
  doc.text(recipientTitle, 15, yPos + 6);
  doc.text("Academic Affairs Department", 15, yPos + 12);
  doc.text("SPIT, Mumbai - 400058", 15, yPos + 18);
  
  yPos += 28;
  
  // Salutation
  doc.text("Dear Sir/Madam,", 15, yPos);
  yPos += 10;
  
  // Subject
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("Subject: REQUEST FOR PRE-EVENT ABSENCE PERMISSION", 15, yPos);
  yPos += 10;
  
  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const bodyText = `I, ${documentData.studentName} (ID: ${documentData.studentId}), a student of SE Year IV Semester in the Department of Computer Engineering, am writing to request permission for absence from academic activities on ${documentData.dates.join(", ")} due to Event Participation.

I understand my responsibility to complete all missed academic work and submit the required documentation. I assure you that I will coordinate with my faculty members to compensate for the missed lectures and practical sessions.`;
  
  const bodyLines = doc.splitTextToSize(bodyText, 170);
  doc.text(bodyLines, 15, yPos);
  
  yPos += bodyLines.length * 5 + 10;
  
  // Academic Impact Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ACADEMIC IMPACT SUMMARY", 15, yPos);
  yPos += 8;
  
  const headers = ["Type", "", "Compensation Plan"];
  const rows: string[][] = [];
  
  documentData.missedLectures.forEach((lecture, idx) => {
    rows.push([
      "Lecture",
      lecture,
      "Self-study and submission of assignments"
    ]);
  });
  
  documentData.missedLabs.forEach((lab, idx) => {
    rows.push([
      "Practical",
      lab,
      "Complete lab work and submit report"
    ]);
  });
  
  yPos = drawTable(doc, 15, yPos, headers, rows, [25, 90, 65]) + 12;
  
  // Closing
  doc.text("Thanking you in anticipation.", 15, yPos);
  yPos += 10;
  
  doc.text("Yours faithfully,", 15, yPos);
  yPos += 15;
  
  // Signature
  doc.setLineWidth(0.5);
  doc.setDrawColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.line(15, yPos, 60, yPos);
  doc.text(documentData.studentName, 15, yPos + 5);
  doc.text(documentData.studentId, 15, yPos + 10);
  
  addLetterFooter(doc);
  
  return doc;
};

// DOCUMENT 2: Post-Event Permission Letter (to Dean)
export const generatePostEventPermissionLetter = (documentData: AcademicDocument, recipientName: string = "Dr. Sunita Desai", recipientTitle: string = "Dean of Academics") => {
  const doc = new jsPDF();
  
  addLetterHeader(doc);
  
  let yPos = 50;
  
  // Reference and Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const refNumber = `REF: PERM/POST/SE2024001/2026`;
  doc.text(refNumber, 15, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, yPos);
  
  yPos += 15;
  
  // Recipient Address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(recipientName, 15, yPos);
  doc.text(recipientTitle, 15, yPos + 6);
  doc.text("Academic Affairs Department", 15, yPos + 12);
  doc.text("SPIT, Mumbai - 400058", 15, yPos + 18);
  
  yPos += 28;
  
  // Salutation
  doc.text("Dear Sir/Madam,", 15, yPos);
  yPos += 10;
  
  // Subject
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("Subject: POST-EVENT PARTICIPATION REPORT AND APPROVAL REQUEST", 15, yPos);
  yPos += 10;
  
  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const bodyText = `I, ${documentData.studentName} (ID: ${documentData.studentId}), a student of SE Year IV Semester in the Department of Computer Engineering, hereby submit my participation report and request post-event approval for my absence during the event held on ${documentData.dates.join(", ")}.

I have attached the event participation certificates as proof. I acknowledge the academic coursework I have missed during this period and commit to completing all make-up work as per the scheduled timeline.`;
  
  const bodyLines = doc.splitTextToSize(bodyText, 170);
  doc.text(bodyLines, 15, yPos);
  
  yPos += bodyLines.length * 5 + 10;
  
  // Missed Coursework Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("MISSED COURSEWORK & MAKE-UP SCHEDULE", 15, yPos);
  yPos += 8;
  
  const headers = ["Type", "Course/Subject", "Make-up Plan"];
  const rows: string[][] = [];
  
  documentData.missedLectures.forEach((lecture) => {
    rows.push([
      "Lecture",
      lecture,
      "Self-study and submission of assignments"
    ]);
  });
  
  documentData.missedLabs.forEach((lab) => {
    rows.push([
      "Practical",
      lab,
      "Complete lab work and submit report"
    ]);
  });
  
  yPos = drawTable(doc, 15, yPos, headers, rows, [25, 90, 65]) + 12;
  
  // Closing
  doc.text("Thanking you for your consideration.", 15, yPos);
  yPos += 10;
  
  doc.text("Yours faithfully,", 15, yPos);
  yPos += 15;
  
  // Signature
  doc.setLineWidth(0.5);
  doc.setDrawColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.line(15, yPos, 60, yPos);
  doc.text(documentData.studentName, 15, yPos + 5);
  doc.text(documentData.studentId, 15, yPos + 10);
  
  addLetterFooter(doc);
  
  return doc;
};

// DOCUMENT 3: Academic Progress Report
export const generateAcademicProgressReport = (documentData: AcademicDocument) => {
  const doc = new jsPDF();
  
  addLetterHeader(doc);
  
  let yPos = 50;
  
  // Reference and Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const refNumber = `REF: PROG/SE2024001/2026`;
  doc.text(refNumber, 15, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, yPos);
  
  yPos += 15;
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ACADEMIC PROGRESS REPORT", 105, yPos, { align: "center" });
  
  yPos += 12;
  
  // Student Information
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("STUDENT INFORMATION", 15, yPos);
  yPos += 8;
  
  const studentHeaders = ["Field", "Details"];
  const studentData = [
    ["Name", documentData.studentName],
    ["Student ID", documentData.studentId],
    ["Department", documentData.department],
    ["Year/Semester", `${documentData.year} Year / ${documentData.semester} Semester`],
  ];
  
  yPos = drawTable(doc, 15, yPos, studentHeaders, studentData, [60, 120]) + 10;
  
  // Absence Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ABSENCE DETAILS", 15, yPos);
  yPos += 8;
  
  const absenceHeaders = ["Date", "Day", "Reason"];
  const absenceData = documentData.dates.map(date => {
    const dateObj = new Date(date);
    return [
      dateObj.toLocaleDateString('en-IN'),
      dateObj.toLocaleDateString('en-IN', { weekday: 'short' }),
      "Event Participation"
    ];
  });
  
  yPos = drawTable(doc, 15, yPos, absenceHeaders, absenceData, [40, 35, 105]) + 10;
  
  // Academic Impact Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ACADEMIC IMPACT SUMMARY", 15, yPos);
  yPos += 8;
  
  const impactHeaders = ["Type", "Subject/Course", "Impact & Status"];
  const impactData: string[][] = [];
  
  documentData.missedLectures.forEach((lecture) => {
    impactData.push([
      "Lecture",
      lecture,
      "Self-study and submission of assignments"
    ]);
  });
  
  documentData.missedLabs.forEach((lab) => {
    impactData.push([
      "Practical",
      lab,
      "Complete lab work and submit report"
    ]);
  });
  
  yPos = drawTable(doc, 15, yPos, impactHeaders, impactData, [25, 80, 75]) + 12;
  
  // Conclusion
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("CONCLUSION", 15, yPos);
  yPos += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  const conclusionText = `The student has submitted all required documentation for the approved absence. All missed academic coursework has been identified and a make-up schedule has been established. The student is expected to complete all pending assignments and practical work within the stipulated timeline.`;
  
  const conclusionLines = doc.splitTextToSize(conclusionText, 170);
  doc.text(conclusionLines, 15, yPos);
  
  yPos += conclusionLines.length * 5 + 15;
  
  // Approvals
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("APPROVALS", 15, yPos);
  yPos += 8;
  
  const approvalHeaders = ["Authority", "Signature", "Date", "Status"];
  const approvalData = [
    ["Class Coordinator", "___________________", "___________", ""],
    ["HOD", "___________________", "___________", ""],
    ["Dean", "___________________", "___________", ""]
  ];
  
  yPos = drawTable(doc, 15, yPos, approvalHeaders, approvalData, [35, 50, 35, 40]) + 12;
  
  addLetterFooter(doc);
  
  return doc;
};

// Enhanced Professional Leave Declaration with Tabular Format
export const generateEnhancedLeavePDF = (documentData: AcademicDocument, recipient?: { name: string; title: string }) => {
  const doc = new jsPDF();

  addLetterHeader(doc);

  let yPos = 50;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ACADEMIC ABSENCE DECLARATION FORM", 105, yPos, { align: "center" });

  yPos += 15;

  // Reference Number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  const refNumber = `REF: ${documentData.studentId}/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  doc.text(refNumber, 15, yPos);

  // Date
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, yPos);

  yPos += 15;

  // Student Information Table
  const studentHeaders = ["Field", "Details"];
  const studentData = [
    ["Student Name", documentData.studentName],
    ["Student ID", documentData.studentId],
    ["Department", documentData.department],
    ["Year/Semester", `${documentData.year} Year / ${documentData.semester} Semester`],
    ["Contact Email", documentData.contactInfo.email],
    ["Contact Phone", documentData.contactInfo.phone],
    ["Reason for Absence", documentData.reason]
  ];

  yPos = drawTable(doc, 15, yPos, studentHeaders, studentData, [50, 130]) + 10;

  // Absence Details Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ABSENCE DETAILS", 15, yPos);
  yPos += 8;

  const absenceHeaders = ["Date", "Day", "Status"];
  const absenceData = documentData.dates.map(date => {
    const dateObj = new Date(date);
    return [
      dateObj.toLocaleDateString('en-IN'),
      dateObj.toLocaleDateString('en-IN', { weekday: 'long' }),
      "Absent"
    ];
  });

  yPos = drawTable(doc, 15, yPos, absenceHeaders, absenceData, [40, 50, 30]) + 10;

  // Missed Academic Work Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("MISSED ACADEMIC WORK", 15, yPos);
  yPos += 8;

  const workHeaders = ["Subject/Type", "Details", "Status"];
  const workData: string[][] = [];

  // Add missed lectures
  documentData.missedLectures.forEach(lecture => {
    workData.push([lecture, "Theory Lecture", "To be Compensated"]);
  });

  // Add missed labs
  documentData.missedLabs.forEach(lab => {
    workData.push([lab, "Practical Session", "To be Compensated"]);
  });

  if (workData.length === 0) {
    workData.push(["None", "No academic work missed", "N/A"]);
  }

  yPos = drawTable(doc, 15, yPos, workHeaders, workData, [60, 70, 40]) + 15;

  // Declaration Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("STUDENT DECLARATION", 15, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  const declarationText = `I, ${documentData.studentName}, hereby declare that the information provided above is true and accurate. I understand that I am responsible for completing all missed academic work and submitting this form to the concerned authorities for approval.`;
  const declarationLines = doc.splitTextToSize(declarationText, 170);
  doc.text(declarationLines, 15, yPos);

  yPos += declarationLines.length * 5 + 10;

  // Signature section
  doc.text("Student Signature: ___________________________", 15, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 130, yPos);

  yPos += 20;

  // Authority Approvals Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("AUTHORITY APPROVALS", 15, yPos);
  yPos += 8;

  const approvalHeaders = ["Authority", "Signature", "Date", "Status"];
  const approvalData = [
    ["Class Coordinator", "___________________", "____________", "Pending"],
    ["HOD", "___________________", "____________", "Pending"],
    ["Dean (Academic)", "___________________", "____________", "Pending"]
  ];

  yPos = drawTable(doc, 15, yPos, approvalHeaders, approvalData, [40, 50, 30, 30]) + 15;

  // Important Notes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.text("IMPORTANT NOTES:", 15, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  const notes = [
    "• This form must be submitted within 3 working days of returning to college.",
    "• All missed assignments and practical work must be completed within the stipulated time.",
    "• Medical certificates (if applicable) must be attached to this form.",
    "• This is a system-generated document. Physical signature is required for validation."
  ];

  notes.forEach(note => {
    doc.text(note, 15, yPos);
    yPos += 4;
  });

  addLetterFooter(doc);

  const fileName = recipient
    ? `Leave_Declaration_${recipient.title.replace(/\s+/g, '_')}.pdf`
    : "Academic_Absence_Declaration.pdf";

  doc.save(fileName);
  return fileName;
};

// Generate Permission Letter for Specific Authority
export const generatePermissionLetter = (
  documentData: AcademicDocument,
  recipient: { name: string; title: string; department: string },
  permissionType: "pre_event" | "post_event" = "pre_event"
) => {
  const doc = new jsPDF();

  addLetterHeader(doc);

  let yPos = 50;

  // Letterhead
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("OFFICIAL PERMISSION REQUEST", 105, yPos, { align: "center" });

  yPos += 10;

  // Reference and Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  const refNumber = `REF: PERM/${documentData.studentId}/${new Date().getFullYear()}`;
  doc.text(refNumber, 15, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, yPos);

  yPos += 15;

  // Recipient Address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(recipient.name, 15, yPos);
  doc.text(recipient.title, 15, yPos + 6);
  doc.text(`${recipient.department} Department`, 15, yPos + 12);
  doc.text("SPIT, Mumbai - 400058", 15, yPos + 18);

  yPos += 35;

  // Salutation
  doc.text("Dear Sir/Madam,", 15, yPos);
  yPos += 12;

  // Subject
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  const subject = permissionType === "pre_event"
    ? "REQUEST FOR PRE-EVENT ABSENCE PERMISSION"
    : "POST-EVENT ABSENCE REGULARIZATION";
  doc.text(`Subject: ${subject}`, 15, yPos);
  yPos += 12;

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  const bodyText = permissionType === "pre_event"
    ? `I, ${documentData.studentName} (ID: ${documentData.studentId}), a student of ${documentData.year} Year ${documentData.semester} Semester in the Department of ${documentData.department}, am writing to request permission for absence from academic activities on ${documentData.dates.join(", ")} due to ${documentData.reason}.

I understand my responsibility to complete all missed academic work and submit the required documentation. I assure you that I will coordinate with my faculty members to compensate for the missed lectures and practical sessions.`
    : `I, ${documentData.studentName} (ID: ${documentData.studentId}), a student of ${documentData.year} Year ${documentData.semester} Semester in the Department of ${documentData.department}, am submitting this application for regularization of my absence from academic activities on ${documentData.dates.join(", ")} due to ${documentData.reason}.

I have attached the necessary supporting documents and will complete all pending academic work as per the guidelines provided by the respective faculty members.`;

  const bodyLines = doc.splitTextToSize(bodyText, 170);
  doc.text(bodyLines, 15, yPos);
  yPos += bodyLines.length * 5 + 10;

  // Academic Impact Table
  if (documentData.missedLectures.length > 0 || documentData.missedLabs.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.text("ACADEMIC IMPACT SUMMARY", 15, yPos);
    yPos += 8;

    const impactHeaders = ["Type", "Subjects/Topics", "Compensatory Action"];
    const impactData: string[][] = [];

    documentData.missedLectures.forEach(lecture => {
      impactData.push(["Lecture", lecture, "Self-study and submission of assignments"]);
    });

    documentData.missedLabs.forEach(lab => {
      impactData.push(["Practical", lab, "Complete lab work and submit report"]);
    });

    yPos = drawTable(doc, 15, yPos, impactHeaders, impactData, [25, 80, 65]) + 10;
  }

  // Closing
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Thanking you in anticipation.", 15, yPos);
  yPos += 8;
  doc.text("Yours faithfully,", 15, yPos);
  yPos += 20;

  // Signature
  doc.setDrawColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.line(15, yPos, 60, yPos);
  doc.text(documentData.studentName, 15, yPos + 5);
  doc.text(`Student ID: ${documentData.studentId}`, 15, yPos + 10);

  // Contact Information
  yPos += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.lightText.r, COLORS.lightText.g, COLORS.lightText.b);
  doc.text(`Email: ${documentData.contactInfo.email} | Phone: ${documentData.contactInfo.phone}`, 15, yPos);

  addLetterFooter(doc);

  const fileName = `Permission_Letter_${recipient.title.replace(/\s+/g, '_')}_${permissionType}.pdf`;
  doc.save(fileName);
  return fileName;
};

// Generate Complete Academic Document Package
export const generateCompleteDocumentPackage = (documentData: AcademicDocument) => {
  const documents: { doc: jsPDF; fileName: string }[] = [];

  try {
    // DOCUMENT 1: Pre-Event Permission Letter (to Class Coordinator/HOD)
    const preEventDoc = generatePreEventPermissionLetter(
      documentData,
      "Dr. Sunita Desai",
      "Class Coordinator"
    );
    documents.push({
      doc: preEventDoc,
      fileName: `${documentData.studentId}_PreEventPermission_${new Date().getTime()}.pdf`
    });

    // DOCUMENT 2: Post-Event Permission Letter (to Dean)
    const postEventDoc = generatePostEventPermissionLetter(
      documentData,
      "Dr. Sunita Desai",
      "Dean of Academics"
    );
    documents.push({
      doc: postEventDoc,
      fileName: `${documentData.studentId}_PostEventPermission_${new Date().getTime()}.pdf`
    });

    // DOCUMENT 3: Academic Progress Report
    const progressDoc = generateAcademicProgressReport(documentData);
    documents.push({
      doc: progressDoc,
      fileName: `${documentData.studentId}_AcademicProgressReport_${new Date().getTime()}.pdf`
    });

  } catch (error) {
    console.error("Error generating document package:", error);
  }

  return documents;
};

// Generate Academic Progress Report
const generateAcademicProgressReport = (documentData: AcademicDocument) => {
  const doc = new jsPDF();

  addLetterHeader(doc);

  let yPos = 50;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("ACADEMIC PROGRESS REPORT", 105, yPos, { align: "center" });

  yPos += 15;

  // Student Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`Student: ${documentData.studentName}`, 15, yPos);
  doc.text(`ID: ${documentData.studentId}`, 130, yPos);
  yPos += 6;
  doc.text(`Department: ${documentData.department}`, 15, yPos);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 130, yPos);

  yPos += 15;

  // Academic Status Table
  const statusHeaders = ["Category", "Status", "Remarks"];
  const statusData = [
    ["Overall Attendance", "Regular", "No attendance issues reported"],
    ["Academic Performance", "Satisfactory", "Maintaining required standards"],
    ["Disciplinary Record", "Clear", "No disciplinary actions"],
    ["Current Status", "Active", "Regular student"]
  ];

  yPos = drawTable(doc, 15, yPos, statusHeaders, statusData, [50, 30, 90]) + 10;

  // Recent Activity Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text("RECENT ACTIVITY SUMMARY", 15, yPos);
  yPos += 8;

  const activityHeaders = ["Date", "Activity", "Status"];
  const activityData = documentData.dates.map(date => [
    new Date(date).toLocaleDateString('en-IN'),
    "Academic Absence",
    "Under Review"
  ]);

  yPos = drawTable(doc, 15, yPos, activityHeaders, activityData, [30, 70, 30]) + 15;

  // Recommendations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.text("RECOMMENDATIONS:", 15, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  const recommendations = [
    "• Complete all missed academic work within stipulated timelines",
    "• Maintain regular attendance in remaining classes",
    "• Submit supporting documents if applicable",
    "• Keep track of academic progress and grades"
  ];

  recommendations.forEach(rec => {
    doc.text(rec, 15, yPos);
    yPos += 5;
  });

  yPos += 10;
  addSignatureBlock(doc, yPos, "Class Coordinator");

  addLetterFooter(doc);

  const fileName = `Academic_Progress_Report_${documentData.studentId}.pdf`;
  doc.save(fileName);
  return fileName;
};

// Enhanced Batch PDF generator - generate multiple PDFs at once
export const generateMultiplePDFs = async (documents: PDFDocument[]) => {
  const generatedFiles: string[] = [];

  for (const docItem of documents) {
    try {
      switch (docItem.type) {
        case "letter":
          // For permission letters, we need academic document data
          if (docItem.data.studentName && docItem.data.studentId) {
            const academicData: AcademicDocument = {
              studentName: docItem.data.studentName as string,
              studentId: docItem.data.studentId as string,
              department: docItem.data.department as string || "Computer Engineering",
              year: docItem.data.year as string || "SE",
              semester: docItem.data.semester as string || "IV",
              dates: docItem.data.dates as string[] || [],
              missedLectures: docItem.data.missedLectures as string[] || [],
              missedLabs: docItem.data.missedLabs as string[] || [],
              reason: docItem.data.reason as string || "Academic Event",
              contactInfo: docItem.data.contactInfo as { email: string; phone: string } || { email: "student@spit.ac.in", phone: "+91-9876543210" }
            };
            const recipient = {
              name: docItem.data.recipientName as string,
              title: docItem.data.recipientTitle as string,
              department: docItem.data.department as string || "Academic Affairs"
            };
            generatePermissionLetter(academicData, recipient);
            generatedFiles.push(`${docItem.fileName}.pdf`);
          }
          break;
        case "declaration":
          // Use enhanced declaration if academic document data is provided
          if (docItem.data.studentName && docItem.data.studentId) {
            const academicData: AcademicDocument = {
              studentName: docItem.data.studentName as string,
              studentId: docItem.data.studentId as string,
              department: docItem.data.department as string || "Computer Engineering",
              year: docItem.data.year as string || "SE",
              semester: docItem.data.semester as string || "IV",
              dates: docItem.data.dates as string[] || [],
              missedLectures: docItem.data.missedLectures as string[] || [],
              missedLabs: docItem.data.missedLabs as string[] || [],
              reason: docItem.data.reason as string || "Academic Event",
              contactInfo: docItem.data.contactInfo as { email: string; phone: string } || { email: "student@spit.ac.in", phone: "+91-9876543210" }
            };
            generateEnhancedLeavePDF(academicData, docItem.recipient);
          } else {
            // Fallback - create basic academic document
            const basicData: AcademicDocument = {
              studentName: "Student Name",
              studentId: "SE2024001",
              department: "Computer Engineering",
              year: "SE",
              semester: "IV",
              dates: docItem.data.dates as string[] || [],
              missedLectures: [],
              missedLabs: [],
              reason: "Academic Event",
              contactInfo: { email: "student@spit.ac.in", phone: "+91-9876543210" }
            };
            generateEnhancedLeavePDF(basicData, docItem.recipient);
          }
          break;
      }
      generatedFiles.push(docItem.fileName);
    } catch (error) {
      console.error(`Error generating ${docItem.fileName}:`, error);
    }
  }

  return generatedFiles;
};
