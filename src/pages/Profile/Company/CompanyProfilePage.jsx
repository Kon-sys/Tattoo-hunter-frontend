import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/layout/Header";
import "../../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../../api/apiClient";

const CompanyProfilePage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // если путь /profile/company → сразу режим редактирования
    const isEditRoute = location.pathname.includes("/profile/company");

    let user = null;
    let storedProfile = null;

    try {
        const storedUser = localStorage.getItem("th_user");
        user = storedUser ? JSON.parse(storedUser) : null;

        const storedCompany = localStorage.getItem("company_profile");
        storedProfile = storedCompany ? JSON.parse(storedCompany) : null;
    } catch (e) {
        console.error("Cannot parse localStorage", e);
    }

    const token = localStorage.getItem("token");
    const role = user?.role;
    const login = user?.login;

    const [name, setName] = useState(storedProfile?.name || "");
    const [city, setCity] = useState(storedProfile?.city || "");
    const [address, setAddress] = useState(storedProfile?.address || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // режим: просмотр или редактирование
    const [isEditMode, setIsEditMode] = useState(isEditRoute);

    if (!user || role !== "ROLE_COMPANY") {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">COMPANY PROFILE</h1>
                        <p className="emp-profile-text">
                            Только пользователь с ролью компании может просматривать этот профиль.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !city || !address) {
            setError("Заполните все поля");
            return;
        }

        if (!token) {
            setError("Отсутствует токен авторизации. Перезайдите в систему.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("city", city);
            formData.append("address", address);

            const res = await apiFetch("/api/profile/company", {
                method: "POST",
                headers: {
                    "X-User-Login": login,
                    "X-User-Role": role,
                },
                body: formData, // FormData — всё ок, Content-Type сам проставится браузером
            });


            if (!res.ok) {
                let message = "Ошибка при сохранении профиля компании";

                try {
                    const data = await res.json();
                    if (data && data.message) {
                        message = data.message;
                    }
                } catch {
                    const text = await res.text();
                    if (text) {
                        message = text;
                    }
                }

                setError(message);
                setLoading(false);
                return;
            }

            const data = await res.json();

            setName(data.name || "");
            setCity(data.city || "");
            setAddress(data.address || "");

            // сохраняем в localStorage, чтобы просмотр показывал актуальные данные
            localStorage.setItem("company_profile", JSON.stringify(data));

            setSuccess("Профиль компании успешно сохранён");
            setLoading(false);

            // если мы пришли на страницу как /profile/company (после регистрации/редактирования) —
            // редиректим на главную
            if (isEditRoute) {
                navigate("/");
            } else {
                // если редактировали из профиля — просто выходим в режим просмотра
                setIsEditMode(false);
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка подключения к серверу");
            setLoading(false);
        }
    };

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">COMPANY PROFILE</h1>

                    {error && <div className="emp-error">{error}</div>}
                    {success && (
                        <div className="emp-profile-text" style={{ color: "#b9ffb9" }}>
                            {success}
                        </div>
                    )}

                    {/* ===== РЕЖИМ ПРОСМОТРА ПРОФИЛЯ ===== */}
                    {!isEditMode && (
                        <>
                            <div className="emp-profile-header">
                                <div className="emp-profile-avatar">
                                    {name ? name.charAt(0).toUpperCase() : "C"}
                                </div>
                                <div className="emp-profile-main">
                                    <h2 className="emp-profile-subtitle">
                                        {name || "Название компании не указано"}
                                    </h2>
                                    <p className="emp-profile-text">
                                        {city || "Город не указан"}
                                    </p>
                                    <p className="emp-profile-text">
                                        {address || "Адрес не указан"}
                                    </p>
                                </div>
                            </div>

                            <div className="emp-profile-sections">
                                <div className="emp-profile-block">
                                    <h3 className="emp-profile-subtitle">Основная информация</h3>
                                    <div className="emp-profile-grid">
                                        <div>
                                            <div className="emp-label">Название компании</div>
                                            <div className="emp-value">
                                                {name || "—"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Город</div>
                                            <div className="emp-value">
                                                {city || "—"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Адрес</div>
                                            <div className="emp-value">
                                                {address || "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="emp-btn emp-btn--small"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    Редактировать профиль
                                </button>
                            </div>
                        </>
                    )}

                    {/* ===== РЕЖИМ РЕДАКТИРОВАНИЯ ПРОФИЛЯ ===== */}
                    {isEditMode && (
                        <form className="emp-form" onSubmit={handleSubmit}>
                            <div className="emp-row">
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Название компании"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="emp-row">
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Город"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div className="emp-row">
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Адрес"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="emp-btn"
                                disabled={loading}
                            >
                                {loading ? "Сохранение..." : "Сохранить профиль"}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CompanyProfilePage;
