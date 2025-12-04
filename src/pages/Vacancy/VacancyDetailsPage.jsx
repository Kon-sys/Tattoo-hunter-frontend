import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const VacancyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vacancy, setVacancy] = useState(null);
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

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                let path;
                let options = { method: "GET" };

                if (role === "ROLE_COMPANY") {
                    // компания смотрит свою вакансию через vacancy-service
                    path = `/api/vacancy/${id}`;
                    options.headers = {
                        "X_User_Login": user?.login,
                        "X_User_Role": role,
                    };
                } else {
                    // работник / гость — через listingvacanciesservice
                    path = `/api/vacancies/${id}`;
                    // headers оставляем пустыми, apiFetch сам добавит Authorization
                }

                const res = await apiFetch(path, options);

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Ошибка загрузки вакансии");
                }

                const data = await res.json();
                if (!cancelled) setVacancy(data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError("Не удалось загрузить вакансию");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id, role, user?.login]);

    const handleRespond = () => {
        alert("Функция отклика будет реализована позже 😊");
    };

    if (loading) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">VACANCY</h1>
                        <p className="emp-profile-text">Загрузка...</p>
                    </section>
                </div>
            </div>
        );
    }

    if (error || !vacancy) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">VACANCY</h1>
                        <p className="emp-profile-text">
                            {error || "Вакансия не найдена"}
                        </p>
                        <Link to="/vacancies" className="emp-link">
                            Назад к списку
                        </Link>
                    </section>
                </div>
            </div>
        );
    }

    const canEdit = role === "ROLE_COMPANY";

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">VACANCY</h1>

                    <div className="emp-profile-header">
                        <div className="emp-profile-avatar">
                            {vacancy.title ? vacancy.title.charAt(0).toUpperCase() : "V"}
                        </div>
                        <div className="emp-profile-main">
                            <h2 className="emp-profile-subtitle">
                                {vacancy.title || "Без названия"}
                            </h2>
                            {vacancy.incomeLevel && (
                                <p className="emp-profile-text">
                                    Доход: {vacancy.incomeLevel}
                                </p>
                            )}
                            {vacancy.companyName && (
                                <p className="emp-profile-text">
                                    Компания: {vacancy.companyName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="emp-profile-sections">
                        <div className="emp-profile-block">
                            <h3 className="emp-profile-subtitle">Основная информация</h3>
                            <div className="emp-profile-grid">
                                <div>
                                    <div className="emp-label">Занятость</div>
                                    <div className="emp-value">
                                        {vacancy.busy || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Опыт (лет)</div>
                                    <div className="emp-value">
                                        {vacancy.experience ?? "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">График</div>
                                    <div className="emp-value">
                                        {vacancy.workSchedule || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Часы в день</div>
                                    <div className="emp-value">
                                        {vacancy.workingHours ?? "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Формат</div>
                                    <div className="emp-value">
                                        {vacancy.workType || "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {vacancy.addInfo && (
                            <div className="emp-profile-block">
                                <h3 className="emp-profile-subtitle">Описание</h3>
                                <p className="emp-profile-text">
                                    {vacancy.addInfo}
                                </p>
                            </div>
                        )}

                        {vacancy.listUrl && (
                            <div className="emp-profile-block">
                                <h3 className="emp-profile-subtitle">Обложка</h3>
                                <img
                                    src={vacancy.listUrl}
                                    alt="Vacancy listing"
                                    style={{
                                        maxWidth: "100%",
                                        borderRadius: "16px",
                                        maxHeight: "260px",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        )}

                        {/* Отклик для работника */}
                        {role === "ROLE_EMPLOYEE" && (
                            <button
                                type="button"
                                className="emp-btn emp-btn--small"
                                onClick={handleRespond}
                            >
                                Откликнуться
                            </button>
                        )}

                        {/* 3 плитки редактирования для компании */}
                        {canEdit && (
                            <div className="emp-edit-grid">
                                <button
                                    type="button"
                                    className="emp-btn emp-btn--full"
                                    onClick={() =>
                                        navigate(`/company/vacancies/${id}/edit/basic`)
                                    }
                                >
                                    Редактировать основную информацию
                                </button>
                                <button
                                    type="button"
                                    className="emp-btn emp-btn--full"
                                    onClick={() =>
                                        navigate(`/company/vacancies/${id}/edit/additional`)
                                    }
                                >
                                    Редактировать описание
                                </button>
                                <button
                                    type="button"
                                    className="emp-btn emp-btn--full"
                                    onClick={() =>
                                        navigate(`/company/vacancies/${id}/edit/photo`)
                                    }
                                >
                                    Обновить обложку
                                </button>
                            </div>
                        )}

                        <Link to="/vacancies" className="emp-link">
                            ← Назад к списку вакансий
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VacancyDetailsPage;
