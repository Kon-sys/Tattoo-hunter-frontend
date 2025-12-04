// src/pages/Chat/ChatListPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const ChatListPage = () => {
    const [chats, setChats] = useState([]);
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

        const loadChats = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                let res;

                if (role === "ROLE_EMPLOYEE") {
                    // чаты работника
                    res = await apiFetch("/api/chats/employee", {
                        method: "GET",
                        headers: {
                            "X-User-Login": login,
                        },
                    });
                } else if (role === "ROLE_COMPANY") {
                    // сначала получаем вакансии компании, чтобы выдернуть companyId
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
                        throw new Error("У компании нет вакансий — чатов пока нет.");
                    }

                    const companyId = vacancies[0].companyId;
                    if (!companyId) {
                        throw new Error("Не удалось определить companyId");
                    }

                    // теперь дергаем чаты для компании
                    res = await apiFetch(
                        `/api/chats/company?companyId=${companyId}`,
                        {
                            method: "GET",
                            headers: {
                                "X-User-Login": login,
                            },
                        }
                    );
                } else {
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || "Не удалось загрузить чаты");
                }

                const data = await res.json();
                if (!cancelled) {
                    setChats(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError(err.message || "Ошибка загрузки чатов");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadChats();

        return () => {
            cancelled = true;
        };
    }, [login, role]); // ЭТИ ДВЕ ЗАВИСИМОСТИ достаточно

    if (!user) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">CHATS</h1>
                        <p className="emp-profile-text">
                            Для доступа к чатам нужно войти в систему.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />
            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">CHATS</h1>

                    {loading && <p className="emp-profile-text">Загрузка...</p>}
                    {error && <p className="emp-error">{error}</p>}

                    {!loading && !error && chats.length === 0 && (
                        <p className="emp-profile-text">Чатов пока нет.</p>
                    )}

                    <div className="emp-profile-sections">
                        {chats.map((c) => (
                            <div
                                key={c.id}
                                className="emp-profile-block"
                                style={{ marginBottom: "12px" }}
                            >
                                <div className="emp-profile-grid">
                                    <div>
                                        <div className="emp-label">ID чата</div>
                                        <div className="emp-value">{c.id}</div>
                                    </div>
                                    <div>
                                        <div className="emp-label">Вакансия</div>
                                        <div className="emp-value">
                                            {c.vacancyId ? `Vacancy #${c.vacancyId}` : "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="emp-label">
                                            {role === "ROLE_EMPLOYEE"
                                                ? "Компания"
                                                : "Работник"}
                                        </div>
                                        <div className="emp-value">
                                            {role === "ROLE_EMPLOYEE"
                                                ? c.companyId
                                                : c.employeeLogin}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: "12px" }}>
                                    <Link
                                        to={`/chats/${c.id}`}
                                        className="emp-link"
                                    >
                                        Открыть чат
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

export default ChatListPage;
