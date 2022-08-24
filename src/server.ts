import axios  from "axios";
import store from "@/store/index";

export const client = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
});

client.interceptors.request.use(async (config) => {
    const user = await store.getters["user"];
    if (Object.prototype.hasOwnProperty.call(user, "token")) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config.headers["Authorization"] = `Bearer ${user.token}`;
    }
    return config;
});