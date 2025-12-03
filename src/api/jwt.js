export function parseJwt(token) {
    try {
        return JSON.parse(
            decodeURIComponent(
                atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            )
        );
    } catch (e) {
        console.error("JWT parse error:", e);
        return null;
    }
}
