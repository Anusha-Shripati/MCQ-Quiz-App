import axios from "axios";

const instance = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL,
})

instance.interceptors.response.use(
    (res) => res,
    (err)=>{
        if(err.response.status === 401){
            localStorage.clear()
            document.cookie = "token=; path=/;";
            window.location.href ='/'
        }else{
            return Promise.reject(err)
        }
    }
)

export default instance

