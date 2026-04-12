import axios from "axios";

const REQUEST_TIMEOUT_MS = Number(process.env.REACT_APP_API_TIMEOUT_MS || 20000);

export const axiosInstance = axios.create({
    timeout: REQUEST_TIMEOUT_MS,
});

export const apiConnector = (
    method,
    url,
    bodyData,
    headers,
    params,
    onUploadProgress,
    requestOptions = {}
) => {
    const resolvedTimeout = Number(requestOptions.timeout ?? REQUEST_TIMEOUT_MS);

    const config = {
        method,
        url,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
        timeout: resolvedTimeout,
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
