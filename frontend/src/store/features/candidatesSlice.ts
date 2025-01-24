import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define types
interface Filters {
  technology?: string;
  experience?: string;
  result?: string;
}

interface Sorting {
  field: string;
  order: "asc" | "desc";
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
}

interface CandidatesState {
  candidates: Candidate[];
  filters: Filters;
  sorting: Sorting;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

interface Candidate {
    id: number;
    date: string;
    name: string;
    email: string;
    technology: string;
    experience: string;
    assessment: string;
    result: string;
    created: string;
    testStartDate: string; // New field
    testEndDate: string;   // New field
    details: CandidateDetails;
  }

interface CandidateDetails {
    totalPercentage: string;
    categories: {
      [key: string]: string;
    };
    createdBy: string;
    createdOn: string;
  }

// Initial state
const initialState: CandidatesState = {
  candidates: [],
  filters: {},
  sorting: {
    field: "date",
    order: "asc",
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLoading: false,
  error: null,
};

// Async thunk to fetch candidates
export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { filters, sorting, pagination } = state.candidates;

    const params = {
      ...filters,
      sortBy: sorting.field,
      sortOrder: sorting.order,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    };

    const response = await axios.get("/api/candidates", { params });
    return response.data;
  }
);

// Slice
const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Filters>) => {
      state.filters = action.payload;
      state.pagination.currentPage = 1; // Reset to the first page when filters change
    },
    setSorting: (state, action: PayloadAction<Sorting>) => {
      state.sorting = action.payload;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch candidates";
      });
  },
});

export const { setFilters, setSorting, setPagination } = candidatesSlice.actions;
export default candidatesSlice.reducer;