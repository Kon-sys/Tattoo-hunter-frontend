import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const EmployeeResponsesPage = () => {
    const [responses, setResponses] = useState([]);
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
            if (!login || role !== "ROLE_EMPLOYEE") {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const res = await apiFetch("/api/responses/employee", {
                    method: "GET",
                    // ❌ без X-User-Login, Jwt + gateway всё сделают
                });


                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Ошибка загрузки откликов");
                }

                const data = await res.json();
                if (!cancelled) {
                    setResponses(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setError("Не удалось загрузить отклики");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [login, role]);

    const titleText = "Мои отклики";

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">{titleText}</h1>

                    {role !== "ROLE_EMPLOYEE" && (
                        <p className="emp-profile-text">
                            Страница доступна только для работников.
                        </p>
                    )}

                    {role === "ROLE_EMPLOYEE" && (
                        <>
                            {loading && (
                                <p className="emp-profile-text">Загрузка...</p>
                            )}
                            {error && (
                                <div className="emp-error">{error}</div>
                            )}

                            {!loading &&
                                !error &&
                                responses.length === 0 && (
                                    <p className="emp-profile-text">
                                        Вы ещё не откликались ни на одну вакансию.
                                    </p>
                                )}

                            <div className="emp-profile-sections">
                                {responses.map((r) => (
                                    <div
                                        key={r.id}
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
                                                <div
                                                    className="emp-value"
                                                    style={{ fontSize: 16 }}
                                                >
                                                    {/* у нас нет названия вакансии в DTO → показываем ID */}
                                                    Вакансия #{r.vacancyId}
                                                </div>

                                                <div className="emp-profile-text">
                                                    Компания ID: {r.companyId}
                                                </div>

                                                <div className="emp-profile-text">
                                                    Статус: {r.status || "UNKNOWN"}
                                                </div>

                                                {r.createdAt && (
                                                    <div className="emp-profile-text">
                                                        Дата отклика:{" "}
                                                        {new Date(
                                                            r.createdAt
                                                        ).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* переход на страницу вакансии */}
                                            {r.vacancyId && (
                                                <Link
                                                    to={`/vacancies/${r.vacancyId}`}
                                                    className="emp-link"
                                                >
                                                    Перейти к вакансии
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default EmployeeResponsesPage;
