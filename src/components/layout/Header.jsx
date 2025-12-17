import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaComments } from "react-icons/fa";
import logoSkull from "../../assets/logo-skull.png";
import "../../pages/HomePage/HomePage.css";
import { apiFetch } from "../../api/apiClient";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);

    // 1. Читаем th_user из localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("th_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Cannot parse user from localStorage", e);
            }
        }
    }, []);

    // 2. Если это EMPLOYEE — подтягиваем mainPhoto из /api/profile/employee/me
    useEffect(() => {
        const loadEmployeeAvatar = async () => {
            if (!user || user.role !== "ROLE_EMPLOYEE") return;

            try {
                const res = await apiFetch("/api/profile/employee/me", {
                    method: "GET",
                });

                if (!res.ok) {
                    console.log("Cannot load employee profile:", res.status);
                    return;
                }

                const data = await res.json();

                // обновляем user, добавляя avatarUrl
                setUser((prev) =>
                    prev
                        ? {
                            ...prev,
                            avatarUrl: data.mainPhoto || prev.avatarUrl || null,
                            fullName:
                                prev.fullName ||
                                (data.firstName || data.lastName
                                    ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
                                    : prev.fullName),
                        }
                        : prev
                );

                // синхронизируем обратно в localStorage, чтобы не терялось при перезагрузке
                const updated = {
                    ...(user || {}),
                    avatarUrl: data.mainPhoto || user?.avatarUrl || null,
                };
                localStorage.setItem("th_user", JSON.stringify(updated));
            } catch (e) {
                console.error("Error loading employee profile", e);
            }
        };

        loadEmployeeAvatar();
    }, [user?.role]); // реагируем, когда появилась ROLE_EMPLOYEE

    const isAuthenticated = !!user;
    const isCompany = user?.role === "ROLE_COMPANY";
    const isEmployee = user?.role === "ROLE_EMPLOYEE";
    const isAdmin = user?.role === "ROLE_ADMIN"; // ✅ ДОБАВЛЕНО

    const getAvatarLetter = () =>
        user?.fullName?.[0]?.toUpperCase() ||
        user?.email?.[0]?.toUpperCase() ||
        "U";

    const isActive = (path) => location.pathname === path;

    const go = (path) => () => navigate(path);

    const goAddVacancy = () => navigate("/company/vacancies/new");
    const goCompanyVacancies = () => navigate("/vacancies");
    const goVacancies = () => navigate("/vacancies");
    const goResponses = () => navigate("/responses");
    const goChat = () => navigate("/chats");
    const goProfile = () => navigate("/profile");

    // 🔥 Responses для компании
    const goCompanyResponses = () => navigate("/company/responses");

    // ✅ Analytics для админа
    const goAnalytics = () => navigate("/admin/analytics");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("th_user");
        setUser(null);
        navigate("/login");
    };

    return (
        <header className="th-header">
            <div className="th-header-left" onClick={go("/")}>
                <img
                    src={logoSkull}
                    alt="Tattoo Hunter logo"
                    className="th-logo-img"
                />
                <span className="th-logo-text">Tattoo Hunter</span>
            </div>

            <nav className="th-nav-center">
                <button
                    className={"th-nav-link " + (isActive("/") ? "th-nav-link-active" : "")}
                    onClick={go("/")}
                >
                    Home
                </button>
                <button
                    className={"th-nav-link " + (isActive("/about") ? "th-nav-link-active" : "")}
                    onClick={go("/about")}
                >
                    About Us
                </button>
                <button
                    className={"th-nav-link " + (isActive("/contact") ? "th-nav-link-active" : "")}
                    onClick={go("/contact")}
                >
                    Contact Us
                </button>

                {isCompany && (
                    <>
                        <button className="th-nav-link" onClick={goAddVacancy}>
                            Add Vacancy
                        </button>
                        <button className="th-nav-link" onClick={goCompanyVacancies}>
                            Your Vacancies
                        </button>
                        <button className="th-nav-link" onClick={goCompanyResponses}>
                            Responses
                        </button>
                    </>
                )}

                {isEmployee && (
                    <>
                        <button className="th-nav-link" onClick={goVacancies}>
                            Vacancies
                        </button>
                        <button className="th-nav-link" onClick={goResponses}>
                            Responses
                        </button>
                    </>
                )}

                {/* ✅ ТОЛЬКО ДЛЯ ADMIN: одна кнопка Analytics */}
                {isAdmin && (
                    <button
                        className={"th-nav-link " + (isActive("/admin/analytics") ? "th-nav-link-active" : "")}
                        onClick={goAnalytics}
                    >
                        Analytics
                    </button>
                )}
            </nav>

            <div className="th-header-right">
                {isAuthenticated ? (
                    <>
                        <button className="th-chat-btn" onClick={goChat}>
                            <FaComments />
                            <span>Chat</span>
                        </button>

                        <button className="th-avatar" onClick={goProfile}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="avatar" />
                            ) : (
                                <span>{getAvatarLetter()}</span>
                            )}
                        </button>

                        <button className="th-nav-link th-logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button className="th-nav-link th-login-btn" onClick={go("/login")}>
                            Login
                        </button>
                        <button className="th-primary-btn" onClick={go("/register")}>
                            Register
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
