import axios from "@/components/Axios";

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

export const fetcher = async (url:string)=>{
  const response = await axios.get(url);
  
  return response.data;
}
export const postData = async <T>(url:string,data:T)=>{
  const response = await axios.post(url,data);
  return response.data;
}

export const deleteData = async (url:string)=>{
  const response = await axios.delete(url);
  return response.data;
}
export const  isAxiosError=(error: unknown): error is { response: { data: { message: string } } } => {
  return typeof error === "object" && error !== null && "response" in error;
}
