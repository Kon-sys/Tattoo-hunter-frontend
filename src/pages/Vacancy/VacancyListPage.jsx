import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const VacancyListPage = () => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    let user = null;
    try {
        const stored = localStorage.getItem("th_user");
        user = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Cannot parse th_user", e);
    }

    const role = user?.role;
    const login = user?.login;

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                let res;

                if (role === "ROLE_COMPANY") {
                    // 🏢 компания — забираем только ЕЁ вакансии через vacancy-service
                    res = await apiFetch("/api/vacancy/company", {
                        method: "GET",
                        headers: {
                            "X_User_Login": login,
                            "X_User_Role": role,
                        },
                    });
                } else {
                    // 👤 employee или гость — общий список через listing-vacancies-service
                    res = await apiFetch("/api/vacancies", {
                        method: "GET",
                    });
                }

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Ошибка загрузки вакансий");
                }

                const data = await res.json();
                if (!cancelled) {
                    setVacancies(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setError("Не удалось загрузить вакансии");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [role, login]);

    const titleText =
        role === "ROLE_COMPANY" ? "Ваши вакансии" : "Вакансии";

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">{titleText}</h1>

                    {loading && <p className="emp-profile-text">Загрузка...</p>}
                    {error && <div className="emp-error">{error}</div>}

                    {!loading && !error && vacancies.length === 0 && (
                        <p className="emp-profile-text">
                            Вакансий пока нет.
                        </p>
                    )}

                    <div className="emp-profile-sections">
                        {vacancies.map((v) => (
                            <div
                                key={v.id}
                                className="emp-profile-block"
                                style={{ marginBottom: "12px" }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div className="emp-value" style={{ fontSize: 16 }}>
                                            {v.title || "Без названия"}
                                        </div>
                                        {v.incomeLevel && (
                                            <div className="emp-profile-text">
                                                {v.incomeLevel}
                                            </div>
                                        )}
                                        {v.companyName && (
                                            <div className="emp-profile-text">
                                                Компания: {v.companyName}
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/vacancies/${v.id}`}
                                        className="emp-link"
                                    >
                                        Смотреть
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VacancyListPage;
