import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const VacancyListPage = () => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --- состояние для поиска и фильтров (для работника) ---
    const [searchTitle, setSearchTitle] = useState("");
    const [income, setIncome] = useState("");
    const [busy, setBusy] = useState("");
    const [workSchedule, setWorkSchedule] = useState("");
    const [workType, setWorkType] = useState("");
    const [minExperience, setMinExperience] = useState("");
    const [maxExperience, setMaxExperience] = useState("");
    const [minWorkingHours, setMinWorkingHours] = useState("");
    const [maxWorkingHours, setMaxWorkingHours] = useState("");
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);

    let user = null;
    try {
        const stored = localStorage.getItem("th_user");
        user = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Cannot parse th_user", e);
    }

    const role = user?.role;
    const login = user?.login;

    // --- вспомогательная функция первичной загрузки списка ---
    const loadInitialVacancies = async (currentRole, currentLogin) => {
        try {
            setLoading(true);
            setError("");

            let res;
            if (currentRole === "ROLE_COMPANY") {
                // 🏢 компания — только свои вакансии через vacancy-service
                res = await apiFetch("/api/vacancy/company", {
                    method: "GET",
                    headers: {
                        "X_User_Login": currentLogin,
                        "X_User_Role": currentRole,
                    },
                });
            } else {
                // 👤 работник или гость — общий список через listing-vacancies-service
                res = await apiFetch("/api/vacancies", {
                    method: "GET",
                });
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Ошибка загрузки вакансий");
            }

            const data = await res.json();
            setVacancies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить вакансии");
        } finally {
            setLoading(false);
        }
    };

    // --- загрузка вакансий при монтировании / смене роли ---
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            await loadInitialVacancies(role, login);
        };

        if (!cancelled) {
            load();
        }

        return () => {
            cancelled = true;
        };
    }, [role, login]);

    // --- загрузка списка компаний для фильтра (только для работника) ---
    useEffect(() => {
        if (role !== "ROLE_EMPLOYEE") return;

        let cancelled = false;

        const loadCompanies = async () => {
            try {
                const res = await apiFetch("/api/vacancies/company", {
                    method: "GET",
                    headers: {
                        "X_User_Role": role,
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Ошибка загрузки компаний:", text);
                    return;
                }

                const data = await res.json();
                if (!cancelled) {
                    setCompanies(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Не удалось загрузить компании:", err);
            }
        };

        loadCompanies();

        return () => {
            cancelled = true;
        };
    }, [role]);

    // --- переключение чекбоксов компаний ---
    const toggleCompany = (companyId) => {
        setSelectedCompanyIds((prev) =>
            prev.includes(companyId)
                ? prev.filter((id) => id !== companyId)
                : [...prev, companyId]
        );
    };

    // --- обработчик поиска по названию (для работника) ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (role !== "ROLE_EMPLOYEE") return;

        if (!searchTitle.trim()) {
            // если пустой поиск — просто вернёмся к полному списку / фильтрам
            await loadInitialVacancies(role, login);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.append("title", searchTitle.trim());

            const res = await apiFetch(`/api/vacancies/search?${params.toString()}`, {
                method: "GET",
                headers: {
                    "X_User_Role": role,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Ошибка поиска вакансий");
            }

            const data = await res.json();
            setVacancies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Не удалось выполнить поиск");
        } finally {
            setLoading(false);
        }
    };

    // --- обработчик применения фильтров (для работника) ---
    const handleApplyFilters = async (e) => {
        e.preventDefault();
        if (role !== "ROLE_EMPLOYEE") return;

        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (income.trim()) params.append("income", income.trim());
            if (busy) params.append("busy", busy);
            if (workSchedule) params.append("workSchedule", workSchedule);
            if (workType) params.append("workType", workType);

            if (minExperience) params.append("minExperience", minExperience);
            if (maxExperience) params.append("maxExperience", maxExperience);
            if (minWorkingHours) params.append("minWorkingHours", minWorkingHours);
            if (maxWorkingHours) params.append("maxWorkingHours", maxWorkingHours);

            // несколько компаний
            selectedCompanyIds.forEach((id) => {
                params.append("companyIds", id);
            });

            console.log("Selected companies:", selectedCompanyIds);
            console.log("Filter query string:", params.toString());

            const qs = params.toString();
            const url = qs ? `/api/vacancies/filter?${qs}` : "/api/vacancies";

            const options =
                url.startsWith("/api/vacancies/filter")
                    ? {
                        method: "GET",
                        headers: {
                            "X_User_Role": role,
                        },
                    }
                    : {
                        method: "GET",
                    };

            const res = await apiFetch(url, options);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Ошибка фильтрации вакансий");
            }

            const data = await res.json();
            setVacancies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Не удалось применить фильтры");
        } finally {
            setLoading(false);
        }
    };

    // --- сброс фильтров ---
    const handleResetFilters = async () => {
        setSearchTitle("");
        setIncome("");
        setBusy("");
        setWorkSchedule("");
        setWorkType("");
        setMinExperience("");
        setMaxExperience("");
        setMinWorkingHours("");
        setMaxWorkingHours("");
        setSelectedCompanyIds([]);
        await loadInitialVacancies(role, login);
    };

    const titleText =
        role === "ROLE_COMPANY" ? "Ваши вакансии" : "Вакансии";

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">{titleText}</h1>

                    {/* Фильтры и поиск только для работника */}
                    {role === "ROLE_EMPLOYEE" && (
                        <div
                            className="emp-profile-block"
                            style={{ marginBottom: "20px" }}
                        >
                            {/* Поиск по названию */}
                            <form
                                onSubmit={handleSearch}
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    marginBottom: "16px",
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Поиск по названию вакансии..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="emp-btn emp-btn--small"
                                    style={{ width: "auto", whiteSpace: "nowrap" }}
                                >
                                    Найти
                                </button>
                            </form>

                            {/* Фильтры */}
                            <form
                                onSubmit={handleApplyFilters}
                                className="emp-form"
                                style={{ gap: "12px" }}
                            >
                                <div className="emp-row">
                                    <input
                                        type="text"
                                        className="emp-input"
                                        placeholder="Доход (строка, например: от 2000 BYN)"
                                        value={income}
                                        onChange={(e) => setIncome(e.target.value)}
                                    />
                                </div>

                                <div className="emp-row">
                                    <select
                                        className="emp-input"
                                        value={busy}
                                        onChange={(e) => setBusy(e.target.value)}
                                    >
                                        <option value="">Занятость: любая</option>
                                        {/* значения value должны совпадать с enum Busy */}
                                        <option value="FULL_EMPLOYMENT">
                                            Полная занятость
                                        </option>
                                        <option value="PRIVATE_EMPLOYMENT">
                                            Частичная занятость
                                        </option>
                                        {/* при необходимости добавь остальные варианты */}
                                    </select>

                                    <select
                                        className="emp-input"
                                        value={workSchedule}
                                        onChange={(e) => setWorkSchedule(e.target.value)}
                                    >
                                        <option value="">График: любой</option>
                                        <option value="TWO_DAYS_ON_TWO_DAYS_OFF">
                                            2/2
                                        </option>
                                        <option value="FIVE_DAYS_ON_TWO_DAYS_OFF">
                                            5/2
                                        </option>
                                        <option value="SIX_DAYS_ON_ONE_DAY_OFF">
                                            6/1
                                        </option>
                                        <option value="SHIFT_DAY_NIGHT">
                                            Сменный (день/ночь)
                                        </option>
                                        <option value="FLEXIBLE">Гибкий</option>
                                    </select>

                                    <select
                                        className="emp-input"
                                        value={workType}
                                        onChange={(e) => setWorkType(e.target.value)}
                                    >
                                        <option value="">Формат: любой</option>
                                        <option value="AT_STUDIO">В студии</option>
                                        <option value="REMOTE">Удалённо</option>
                                        <option value="HYBRID">Гибрид</option>
                                    </select>
                                </div>

                                <div className="emp-row">
                                    <input
                                        type="number"
                                        className="emp-input"
                                        placeholder="Опыт, от (лет)"
                                        value={minExperience}
                                        onChange={(e) => setMinExperience(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="emp-input"
                                        placeholder="Опыт, до (лет)"
                                        value={maxExperience}
                                        onChange={(e) => setMaxExperience(e.target.value)}
                                    />
                                </div>

                                <div className="emp-row">
                                    <input
                                        type="number"
                                        className="emp-input"
                                        placeholder="Часы в день, от"
                                        value={minWorkingHours}
                                        onChange={(e) =>
                                            setMinWorkingHours(e.target.value)
                                        }
                                    />
                                    <input
                                        type="number"
                                        className="emp-input"
                                        placeholder="Часы в день, до"
                                        value={maxWorkingHours}
                                        onChange={(e) =>
                                            setMaxWorkingHours(e.target.value)
                                        }
                                    />
                                </div>

                                {/* чекбоксы компаний */}
                                {companies.length > 0 && (
                                    <div>
                                        <div className="emp-label">
                                            Компании (выберите одну или несколько):
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "8px",
                                                marginTop: "6px",
                                            }}
                                        >
                                            {companies.map((c) => (
                                                <label
                                                    key={c.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        background:
                                                            "rgba(0,0,0,0.35)",
                                                        borderRadius: "12px",
                                                        padding:
                                                            "6px 10px 6px 10px",
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCompanyIds.includes(
                                                            c.id
                                                        )}
                                                        onChange={() =>
                                                            toggleCompany(c.id)
                                                        }
                                                    />
                                                    <span className="emp-value">
                                                        {c.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        marginTop: "10px",
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="emp-btn emp-btn--small"
                                        style={{ width: "auto" }}
                                    >
                                        Применить фильтры
                                    </button>
                                    <button
                                        type="button"
                                        className="emp-btn emp-btn--small"
                                        style={{
                                            width: "auto",
                                            background: "rgba(0,0,0,0.4)",
                                        }}
                                        onClick={handleResetFilters}
                                    >
                                        Сбросить
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading && (
                        <p className="emp-profile-text">Загрузка...</p>
                    )}
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
                                        <div
                                            className="emp-value"
                                            style={{ fontSize: 16 }}
                                        >
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
