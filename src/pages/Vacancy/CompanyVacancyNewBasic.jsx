// src/pages/Vacancy/CompanyVacancyNewBasic.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const busyOptions = [
    { value: "FULL_EMPLOYMENT", label: "Полная занятость" },
    { value: "PRIVATE_EMPLOYMENT", label: "Частичная занятость" },
];

const workScheduleOptions = [
    { value: "TWO_DAYS_ON_TWO_DAYS_OFF", label: "2/2" },
    { value: "FIVE_DAYS_ON_TWO_DAYS_OFF", label: "5/2" },
    { value: "SIX_DAYS_ON_ONE_DAY_OFF", label: "6/1" },
    { value: "SHIFT_DAY_NIGHT", label: "День/ночь" },
    { value: "FLEXIBLE", label: "Гибкий график" },
];

const workTypeOptions = [
    { value: "AT_STUDIO", label: "В студии" },
    { value: "REMOTE", label: "Удалённо" },
    { value: "HYBRID", label: "Гибрид" },
];

const CompanyVacancyNewBasic = () => {
    const navigate = useNavigate();

    let user = null;
    try {
        const storedUser = localStorage.getItem("th_user");
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Cannot parse th_user", e);
    }

    const role = user?.role;
    const login = user?.login;

    const [title, setTitle] = useState("");
    const [incomeLevel, setIncomeLevel] = useState("");
    const [busy, setBusy] = useState("");
    const [experience, setExperience] = useState("");
    const [workSchedule, setWorkSchedule] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [workType, setWorkType] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!user || role !== "ROLE_COMPANY") {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">NEW VACANCY</h1>
                        <p className="emp-profile-text">
                            Только пользователь с ролью компании может создавать вакансии.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title) {
            setError("Заполните название вакансии");
            return;
        }
        if (!busy) {
            setError("Выберите занятость");
            return;
        }
        if (!workSchedule) {
            setError("Выберите график работы");
            return;
        }
        if (!workType) {
            setError("Выберите формат работы");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            if (incomeLevel) formData.append("incomeLevel", incomeLevel);
            formData.append("busy", busy);                  // enum Busy
            if (experience) formData.append("experience", experience); // int
            formData.append("workSchedule", workSchedule);  // enum WorkSchedule
            if (workingHours) formData.append("workingHours", workingHours); // int
            formData.append("workType", workType);          // enum WorkType

            const res = await apiFetch("/api/vacancy", {
                method: "POST",
                headers: {
                    "X_User_Login": login,
                    "X_User_Role": role,
                },
                body: formData,
            });

            if (!res.ok) {
                let message = "Ошибка при создании вакансии";
                try {
                    const data = await res.json();
                    if (data && data.message) {
                        message = data.message;
                    }
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                setError(message);
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (data.id) {
                localStorage.setItem("th_current_vacancy_id", String(data.id));
            }

            setLoading(false);
            navigate("/company/vacancies/new/additional");
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
                <section className="emp-card">
                    <h1 className="emp-title">NEW VACANCY</h1>
                    <p className="emp-profile-text">
                        Шаг 1 из 3 — основная информация по вакансии.
                    </p>

                    {error && <div className="emp-error">{error}</div>}

                    <form className="emp-form" onSubmit={handleSubmit}>
                        {/* Название вакансии */}
                        <div className="emp-row">
                            <input
                                type="text"
                                className="emp-input"
                                placeholder="Название вакансии (напр. Тату-мастер)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Уровень дохода */}
                        <div className="emp-row">
                            <input
                                type="text"
                                className="emp-input"
                                placeholder="Уровень дохода (напр. 1500–2500 BYN)"
                                value={incomeLevel}
                                onChange={(e) => setIncomeLevel(e.target.value)}
                            />
                        </div>

                        {/* Занятость (Busy) плитками */}
                        <div className="emp-profile-text" style={{ marginTop: "10px" }}>
                            Занятость:
                        </div>
                        <div className="emp-grid">
                            {busyOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "emp-tile" +
                                        (busy === opt.value ? " emp-tile--active" : "")
                                    }
                                    onClick={() => setBusy(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Опыт и часы (int) */}
                        <div className="emp-row">
                            <input
                                type="number"
                                min="0"
                                className="emp-input"
                                placeholder="Опыт (лет, напр. 1, 3, 5)"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                            />
                        </div>

                        <div className="emp-row">
                            <input
                                type="number"
                                min="0"
                                className="emp-input"
                                placeholder="Рабочих часов в день (напр. 8, 10)"
                                value={workingHours}
                                onChange={(e) => setWorkingHours(e.target.value)}
                            />
                        </div>

                        {/* График (WorkSchedule) плитками */}
                        <div className="emp-profile-text" style={{ marginTop: "10px" }}>
                            График работы:
                        </div>
                        <div className="emp-grid">
                            {workScheduleOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "emp-tile" +
                                        (workSchedule === opt.value ? " emp-tile--active" : "")
                                    }
                                    onClick={() => setWorkSchedule(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Формат (WorkType) плитками */}
                        <div className="emp-profile-text" style={{ marginTop: "10px" }}>
                            Формат работы:
                        </div>
                        <div className="emp-grid">
                            {workTypeOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "emp-tile" +
                                        (workType === opt.value ? " emp-tile--active" : "")
                                    }
                                    onClick={() => setWorkType(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="emp-btn"
                            disabled={loading}
                        >
                            {loading ? "Создание..." : "Продолжить"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default CompanyVacancyNewBasic;
