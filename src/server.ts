import axios  from "axios";
import store from "@/store/index";

export const client = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
});

client.interceptors.request.use(async (config) => {
    const user = await store.getters["user"];
    if (user) {
        config.headers = {
            Authorization: `Bearer ${user.token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        };
    }
    return config;
});