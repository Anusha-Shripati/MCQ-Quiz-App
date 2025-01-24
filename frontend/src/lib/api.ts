import axios from "axios";

export const fetchCandidates = async (params: any) => {
  const response = await axios.get("/api/candidates", { params });
  return response.data;
};