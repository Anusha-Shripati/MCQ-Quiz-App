import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AssessmentState {
  name: string;
  categories: {
    name: string;
    questions: {
      easy: number;
      medium: number;
      hard: number;
    };
  }[];
}

const initialState: AssessmentState = {
  name: "",
  categories: [],
};

const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    setAssessmentName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      state.categories.push({
        name: action.payload,
        questions: { easy: 0, medium: 0, hard: 0 },
      });
    },
    updateQuestionCount: (
      state,
      action: PayloadAction<{
        categoryIndex: number;
        difficulty: "easy" | "medium" | "hard";
        value: number;
      }>
    ) => {
      const { categoryIndex, difficulty, value } = action.payload;
      state.categories[categoryIndex].questions[difficulty] = value;
    },
  },
});

export const { setAssessmentName, addCategory, updateQuestionCount } =
  assessmentSlice.actions;

export default assessmentSlice.reducer;