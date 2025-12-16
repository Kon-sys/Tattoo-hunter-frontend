// src/api/apiClient.js
const API_BASE = "http://localhost:8080";

function getTokens() {
    return {
        token: localStorage.getItem("token"),
        refreshToken: localStorage.getItem("refreshToken"),
    };
}

function saveTokens(data) {
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
    }
}

function clearTokens() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
}

// запрос на /api/auth/refresh
async function refreshTokenRequest() {
    const { refreshToken } = getTokens();

    if (!refreshToken) {
        throw new Error("No refresh token");
    }

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Refresh failed");
    }

    const data = await res.json();
    saveTokens(data);
    return data.token; // возвращаем новый access-token
}

// главный helper, которым будем пользоваться везде
export async function apiFetch(path, options = {}, retry = true) {
    const { token } = getTokens();

    const headers = {
        ...(options.headers || {}),
    };

    // не ставим Content-Type для FormData
    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
        // оставляем возможность явно передать Content-Type снаружи
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    // если токен протух и это первый раз — пробуем обновиться
    if (res.status === 401 && retry) {
        try {
            await refreshTokenRequest();
        } catch (e) {
            console.error("Refresh failed:", e);
            clearTokens();
            // можно ещё сделать редирект на /login
            throw e;
        }

        // пробуем повторно тот же запрос, но уже с новым токеном
        return apiFetch(path, options, false);
    }

    return res;
}

export async function apiGetJson(path, options = {}, retry = true) {
    const res = await apiFetch(path, options, retry);

    if (!res.ok) {
        let text = "";
        try {
            text = await res.text();
        } catch (e) {
            // ignore
        }
        throw new Error(text || `Request failed with status ${res.status}`);
    }

    return res.json();
}