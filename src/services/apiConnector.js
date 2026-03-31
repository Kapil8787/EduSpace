import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params, onUploadProgress) => {
    const config = {
        method,
        url,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
    };

    if (typeof onUploadProgress === "function") {
        config.onUploadProgress = (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (total) {
                const progress = Math.round((loaded * 100) / total);
                onUploadProgress(progress);
            }
        };
    }

    return axiosInstance(config);
};