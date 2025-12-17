// src/pages/Vacancy/VacancyDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const VacancyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vacancy, setVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [alreadyResponded, setAlreadyResponded] = useState(false);
    const [respondLoading, setRespondLoading] = useState(false);

    let user = null;
    try {
        const stored = localStorage.getItem("th_user");
        user = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Cannot parse th_user", e);
    }

    const role = user?.role;
    const login = user?.login;

    // 1. грузим вакансию
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await apiFetch(`/api/vacancies/${id}`, {
                    method: "GET",
                });
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
    }, [id]);

    // 2. проверяем, откликался ли уже работник на эту вакансию
    useEffect(() => {
        let cancelled = false;

        const checkResponse = async () => {
            if (!user || role !== "ROLE_EMPLOYEE") return;
            try {
                const res = await apiFetch("/api/responses/employee", {
                    method: "GET",
                    headers: {
                        "X-User-Login": login, // ← важно: этот заголовок ждёт applications-service
                    },
                });
                if (!res.ok) {
                    // молча игнорируем, просто не будем скрывать кнопку
                    return;
                }
                const list = await res.json();
                const vacId = Number(id);

                const has = Array.isArray(list) && list.some((r) => {
                    // r.vacancyId, r.status из ResponseApplicationDto
                    if (r.vacancyId !== vacId) return false;
                    // считаем "уже откликнулся", если отклик не отклонён
                    return r.status === "PENDING" || r.status === "APPROVED";
                });

                if (!cancelled) {
                    setAlreadyResponded(has);
                }
            } catch (e) {
                console.error("checkResponse error", e);
            }
        };

        checkResponse();
        return () => {
            cancelled = true;
        };
    }, [id, role, login, user]);

    const handleRespond = async () => {
        if (alreadyResponded) return;

        if (!user || role !== "ROLE_EMPLOYEE") {
            alert("Только работник может откликнуться на вакансию");
            return;
        }

        if (!vacancy) {
            alert("Вакансия ещё не загружена");
            return;
        }

        try {
            setRespondLoading(true);
            setError("");

            // предполагаем, что vacancy содержит companyId (иначе добавь его в DTO на бэке)
            const body = {
                vacancyId: vacancy.id,
                companyId: vacancy.companyId,
            };

            const res = await apiFetch("/api/responses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Login": login,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("respond error:", text);
                setError("Не удалось отправить отклик");
                return;
            }

            // если всё ок – считаем, что уже откликнулся
            setAlreadyResponded(true);
            alert("Отклик успешно отправлен!");
        } catch (e) {
            console.error(e);
            setError("Ошибка при отправке отклика");
        } finally {
            setRespondLoading(false);
        }
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

    if (error && !vacancy) {
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

    if (!vacancy) {
        return null;
    }

    const canEdit = role === "ROLE_COMPANY";

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">VACANCY</h1>

                    {error && (
                        <p className="emp-error" style={{ marginBottom: "8px" }}>
                            {error}
                        </p>
                    )}

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

                        {/* Блок с откликом для работника */}
                        {role === "ROLE_EMPLOYEE" && (
                            <>
                                {alreadyResponded ? (
                                    <p className="emp-profile-text">
                                        Вы уже откликнулись на эту вакансию.
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        className="emp-btn emp-btn--small"
                                        onClick={handleRespond}
                                        disabled={respondLoading}
                                    >
                                        {respondLoading ? "Отправка..." : "Откликнуться"}
                                    </button>
                                )}
                            </>
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
            <Footer />
        </div>
    );
};

export default VacancyDetailsPage;
