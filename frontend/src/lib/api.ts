import axios from "axios";

// Define an interface for the expected params structure
interface CandidateParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined; // Allows additional query parameters
}

export const fetchCandidates = async (params: CandidateParams) => {
  const response = await axios.get("/api/candidates", { params });
  return response.data;
};
