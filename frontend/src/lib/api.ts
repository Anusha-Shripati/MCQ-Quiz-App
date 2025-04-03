import axios from "@/components/Axios";

interface CandidateParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined; 
}

export const fetchCandidates = async (params: CandidateParams) => {
  const response = await axios.get("/api/candidates", { params });
  return response.data;
};

export const fetcher = async (url:string)=>{
  const apitString = Array.isArray(url) ? url[0]:url;
  const params =  Array.isArray(url) && url.length == 2 ? url[1] :  {}
  const response = await axios.get(apitString,{params});
  
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
