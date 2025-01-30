import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Question {
  easy: number;
  medium: number;
  hard: number;
}

export interface Technology {
  name: string;
  percentage: number;
  questions: Question;
}

export interface Assessment {
  id: string;
  title: string;
  createdBy: string;
  createdDate: string;
  totalQuestions: number;
  duration: number;
  technologies: Technology[];
}

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [
    {
      id: "mern",
      title: "MERN 3 years",
      createdBy: "MihirBhai",
      createdDate: "20-Jan-2025",
      totalQuestions: 60,
      duration: 60,
      technologies: [
        { name: "MongoDB", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
        { name: "ExpressJS", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
        { name: "ReactJS", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
        { name: "NodeJS", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
      ],
    },
    // ... other initial assessments
  ],
  currentAssessment: null,
  isLoading: false,
  error: null
};

const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    createAssessment: (state, action: PayloadAction<Omit<Assessment, 'id' | 'createdDate'>>) => {
      const newAssessment: Assessment = {
        ...action.payload,
        id: `assessment-${Date.now()}`, // Generate a unique ID
        createdDate: new Date().toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };
      state.assessments.unshift(newAssessment); // Add to the beginning of the array
    },
    updateAssessment: (state, action: PayloadAction<Assessment>) => {
      const index = state.assessments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.assessments[index] = action.payload;
      }
    },
    deleteAssessment: (state, action: PayloadAction<string>) => {
      state.assessments = state.assessments.filter(a => a.id !== action.payload);
    },
    setCurrentAssessment: (state, action: PayloadAction<string>) => {
      state.currentAssessment = state.assessments.find(a => a.id === action.payload) || null;
    },
    clearCurrentAssessment: (state) => {
      state.currentAssessment = null;
    },
    updateTechnologyQuestions: (
      state,
      action: PayloadAction<{ assessmentId: string; techName: string; questions: Technology['questions'] }>
    ) => {
      const assessment = state.assessments.find(a => a.id === action.payload.assessmentId);
      if (assessment) {
        const tech = assessment.technologies.find(t => t.name === action.payload.techName);
        if (tech) {
          tech.questions = action.payload.questions;
        }
      }
    },
    removeTechnology: (
      state,
      action: PayloadAction<{ assessmentId: string; techName: string }>
    ) => {
      const assessment = state.assessments.find(a => a.id === action.payload.assessmentId);
      if (assessment) {
        assessment.technologies = assessment.technologies.filter(
          t => t.name !== action.payload.techName
        );
      }
    },
    addTechnology: (
      state,
      action: PayloadAction<{ assessmentId: string; technology: Omit<Technology, 'questions'> }>
    ) => {
      const assessment = state.assessments.find(a => a.id === action.payload.assessmentId);
      if (assessment) {
        assessment.technologies.push({
          ...action.payload.technology,
          questions: { easy: 0, medium: 0, hard: 0 }
        });
      }
    },
  },
});

export const {
  createAssessment,
  updateAssessment,
  deleteAssessment,
  setCurrentAssessment,
  clearCurrentAssessment,
  updateTechnologyQuestions,
  removeTechnology,
  addTechnology,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;