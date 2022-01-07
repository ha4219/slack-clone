import axios from "axios";

// const fetcher = (url: string) => API.get(url).then((res) => res);
const fetcher = (url: string) => axios.get(url, { withCredentials: true }).then((response) => response.data);

export default fetcher;