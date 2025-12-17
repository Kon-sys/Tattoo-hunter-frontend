// src/pages/Responses/CompanyResponsesPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const CompanyResponsesPage = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [responses, setResponses] = useState([]);
    const [vacancyTitles, setVacancyTitles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [companyId, setCompanyId] = useState(null);

    // 1. Один раз читаем th_user из localStorage
    useEffect(() => {
        const stored = localStorage.getItem("th_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Cannot parse th_user", e);
            }
        } else {
            setUser(null);
        }
    }, []);

    const role = user?.role;
    const login = user?.login;

    // 2. Загрузка откликов компании
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            // если юзера нет или это не компания — просто выключаем загрузку
            if (!user || role !== "ROLE_COMPANY") {
                setLoading(false);
                return;
            }

            try {
                // 1. берём вакансии компании из vacancy-service
                const vacRes = await apiFetch("/api/vacancy/company", {
                    method: "GET",
                    headers: {
                        "X_User_Login": login,
                        "X_User_Role": role,
                    },
                });

                if (!vacRes.ok) {
                    const txt = await vacRes.text();
                    throw new Error(txt || "Не удалось загрузить вакансии компании");
                }

                const vacancies = await vacRes.json();
                if (!Array.isArray(vacancies) || vacancies.length === 0) {
                    if (!cancelled) {
                        setError("У компании ещё нет вакансий, отклики отсутствуют.");
                        setLoading(false);
                    }
                    return;
                }

                const cid = vacancies[0].companyId;
                if (!cancelled) {
                    setCompanyId(cid);
                }

                // 2. берём отклики компании из applications-service
                const respRes = await apiFetch(
                    `/api/responses/company?companyId=${cid}&status=PENDING`,
                    {
                        method: "GET",
                        headers: {
                            "X-User-Login": login,
                        },
                    }
                );

                if (!respRes.ok) {
                    const txt = await respRes.text();
                    throw new Error(txt || "Не удалось загрузить отклики");
                }

                const respList = await respRes.json();
                if (!cancelled) {
                    setResponses(Array.isArray(respList) ? respList : []);
                }

                // 3. подгружаем названия вакансий по vacancyId (listing-vacancies-service)
                const uniqueVacancyIds = Array.from(
                    new Set((respList || []).map((r) => r.vacancyId))
                );

                const titleMap = {};
                await Promise.all(
                    uniqueVacancyIds.map(async (vid) => {
                        try {
                            const vRes = await apiFetch(`/api/vacancies/${vid}`, {
                                method: "GET",
                            });
                            if (!vRes.ok) return;
                            const v = await vRes.json();
                            if (v && v.title) {
                                titleMap[vid] = v.title;
                            }
                        } catch (e) {
                            console.error("Error loading vacancy", vid, e);
                        }
                    })
                );

                if (!cancelled) {
                    setVacancyTitles(titleMap);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError(err.message || "Ошибка загрузки откликов");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        // вызываем загрузку
        load();

        return () => {
            cancelled = true;
        };
        // 🔥 ВАЖНО: тут НЕТ user в зависимостях, только примитивы
    }, [role, login]);

    if (!user || role !== "ROLE_COMPANY") {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">RESPONSES</h1>
                        <p className="emp-profile-text">
                            Доступ к этой странице есть только у компаний.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    const handleApprove = async (response) => {
        try {
            setError("");
            const res = await apiFetch(`/api/responses/${response.id}/approve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Login": login,
                },
                body: "{}", // тело не нужно, но что-то отправим
            });

            if (!res.ok) {
                const txt = await res.text();
                console.error("approve error:", txt);
                setError("Не удалось одобрить отклик");
                return;
            }

            const updated = await res.json();

            // обновляем статус в списке
            setResponses((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
            );

            // пробуем найти соответствующий чат и перейти в него
            if (companyId) {
                try {
                    const chatsRes = await apiFetch(
                        `/api/chats/company?companyId=${companyId}`,
                        {
                            method: "GET",
                            headers: {
                                "X-User-Login": login,
                            },
                        }
                    );
                    if (chatsRes.ok) {
                        const chats = await chatsRes.json();
                        const chat = (chats || []).find(
                            (c) =>
                                c.vacancyId === updated.vacancyId &&
                                c.employeeLogin === updated.employeeLogin
                        );
                        if (chat) {
                            navigate(`/chats/${chat.id}`);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Error while loading chats after approve", e);
                }
            }

            // если чат не нашли — просто на список чатов
            navigate("/chats");
        } catch (e) {
            console.error(e);
            setError("Ошибка при одобрении отклика");
        }
    };

    const handleReject = async (response) => {
        try {
            setError("");
            const res = await apiFetch(`/api/responses/${response.id}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Login": login,
                },
                body: "{}",
            });

            if (!res.ok) {
                const txt = await res.text();
                console.error("reject error:", txt);
                setError("Не удалось отклонить отклик");
                return;
            }

            const updated = await res.json();

            // оставляем только PENDING (отклонённые убираем)
            setResponses((prev) =>
                prev
                    .map((r) => (r.id === updated.id ? updated : r))
                    .filter((r) => r.status === "PENDING")
            );
        } catch (e) {
            console.error(e);
            setError("Ошибка при отклонении отклика");
        }
    };

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">RESPONSES</h1>

                    {loading && <p className="emp-profile-text">Загрузка...</p>}
                    {error && <p className="emp-error">{error}</p>}

                    {!loading && !error && responses.length === 0 && (
                        <p className="emp-profile-text">
                            Откликов на вакансии вашей компании пока нет.
                        </p>
                    )}

                    <div className="emp-profile-sections">
                        {responses.map((r) => {
                            const vacTitle =
                                vacancyTitles[r.vacancyId] || `Vacancy #${r.vacancyId}`;
                            const created = r.createdAt
                                ? new Date(r.createdAt).toLocaleString()
                                : "";

                            return (
                                <div
                                    key={r.id}
                                    className="emp-profile-block"
                                    style={{ marginBottom: "12px" }}
                                >
                                    <div className="emp-profile-grid">
                                        <div>
                                            <div className="emp-label">Вакансия</div>
                                            <div className="emp-value">{vacTitle}</div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Работник</div>
                                            <div className="emp-value">{r.employeeLogin}</div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Статус</div>
                                            <div className="emp-value">{r.status}</div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Создан</div>
                                            <div className="emp-value">{created}</div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "12px",
                                            display: "flex",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Link
                                            to={`/profile/company/view/${r.employeeLogin}`}
                                            className="emp-link"
                                        >
                                            Профиль работника
                                        </Link>

                                        {r.status === "PENDING" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="emp-btn emp-btn--small"
                                                    onClick={() => handleApprove(r)}
                                                >
                                                    Approve & Open Chat
                                                </button>
                                                <button
                                                    type="button"
                                                    className="emp-btn emp-btn--small"
                                                    style={{ background: "#661111" }}
                                                    onClick={() => handleReject(r)}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyResponsesPage;
