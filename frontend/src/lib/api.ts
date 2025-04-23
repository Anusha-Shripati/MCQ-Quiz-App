import axios from "@/components/Axios";
import { candidateInstance } from "@/components/Axios";

interface CandidateParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

interface CreateCandidateData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  assessment_id: string;
  technology_id: string;
  meta: {
    startDate: Date;
    endDate: Date;
    timeUnit: string;
    timeValue: number;
  };
}

export const fetchCandidates = async (params: CandidateParams) => {
  const response = await axios.get("/candidates", { params });
  return response.data;
};

export const createCandidate = async (data: CreateCandidateData) => {
  const response = await axios.post("/candidates", data);
  return response.data;
};

export const fetchTechnologies = async () => {
  const response = await axios.get("/technology/list");
  return response.data.data;
};

export const fetcher = async (url: string) => {
  const apitString = Array.isArray(url) ? url[0] : url;
  const params = Array.isArray(url) && url.length == 2 ? url[1] : {};
  const response = await axios.get(apitString, { params });

  return response.data;
};
export const postData = async <T>(url: string, data: T) => {
  const response = await axios.post(url, data);
  return response.data;
};

export const deleteData = async (url: string) => {
  const response = await axios.delete(url);
  return response.data;
};

export const api = {
	get: async (url: string) => {
		const apitString = Array.isArray(url) ? url[0] : url;
		const params = Array.isArray(url) && url.length == 2 ? url[1] : {};
		const response = await axios.get(apitString, { params });
		return response.data;
	},
	put: async <T>(url: string, data: T) => {
		const response = await axios.put(url, data);
		return response.data;
	},
	post: async <T>(url: string, data: T) => {
		console.log('url', url);
		console.log('data', data);
		const response = await axios.post(url, data);
		console.log('response', response);
		return response.data;
	},
	delete: async (url: string) => {
		const response = await axios.delete(url);
		return response.data;
	},
};

export const examApi = {
	get: async (url: string, accessCode: string) => {
		const config = { headers: { 'X-Access-Code': accessCode } };
		const response = await candidateInstance.get(url, config);
		return response.data;
	},

	post: async <T>(url: string, data: T, accessCode: string) => {
		const config = { headers: { 'X-Access-Code': accessCode } };
		const response = await candidateInstance.post(url, data, config);
		return response.data;
	},
};

export const isAxiosError = (
  error: unknown
): error is { response: { data: { message: string } } } => {
  return typeof error === "object" && error !== null && "response" in error;
};
