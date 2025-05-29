interface Candidate {
  name: string;
  email: string;
}

interface Technology {
  technology: {
    name: string;
  };
}

interface Assessment {
  name: string;
  technologies: Technology[];
}

interface Exam {
  start_time: string;
  assessment: Assessment;
}

interface Result {
  percentage: number;
  candidate: Candidate;
  exam: Exam;
}
export const getDateBoundaries=(now: Date = new Date()) =>{
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  return {
    startOfToday,
    endOfToday,
    startOfLastMonth,
    endOfLastMonth,
  };
}

export const categorizeExamDate=(
  examDate: Date,
  boundaries: ReturnType<typeof getDateBoundaries>
) => {
  const { startOfToday, endOfToday, startOfLastMonth, endOfLastMonth } = boundaries;

  if (examDate >= startOfLastMonth && examDate <= endOfLastMonth) {
    return 'lastMonth';
  } else if (examDate >= startOfToday && examDate <= endOfToday) {
    return 'today';
  } else if (examDate > endOfToday) {
    return 'upcoming';
  }

  return null;
}

export const formatToISTDate = (dateString: string | Date): string => {
  const utcDate = new Date(dateString);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  const day = istDate.getDate().toString().padStart(2, '0');
  const month = istDate.toLocaleString('en-US', { month: 'short' });
  const year = istDate.getFullYear();

  return `${day} ${month}-${year}`;
}

export const convertToISTISOString = (utcDate: Date): string => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + IST_OFFSET_MS);
  return istDate.toISOString();
}

export const formatInterviewResults = (results: Result[]) => {
  return results.map((result) => {
    const scoreValue = Number(result.percentage);
    const techNames = result.exam.assessment.technologies
      .map((t) => t.technology.name)
      .join(', ');

    return {
      date: formatToISTDate(result.exam.start_time),
      name: result.candidate.name,
      email: result.candidate.email,
      score: `${scoreValue.toFixed(2)}%`,
      scoreValue,
      assessmentName: result.exam.assessment.name,
      technologies: techNames,
    };
  });
}

// Helper function for generating month arrays
export const generateLast7Months = (now: Date = new Date()) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: monthNames[date.getMonth()],
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  });
}
