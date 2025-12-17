// src/pages/Vacancy/CompanyVacancyEditBasic.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
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

const CompanyVacancyEditBasic = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user] = useState(() => {
        try {
            const stored = localStorage.getItem("th_user");
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Cannot parse th_user", e);
            return null;
        }
    });

    const role = user?.role;
    const login = user?.login;

    const [title, setTitle] = useState("");
    const [incomeLevel, setIncomeLevel] = useState("");
    const [busy, setBusy] = useState("");
    const [experience, setExperience] = useState("");
    const [workSchedule, setWorkSchedule] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [workType, setWorkType] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!user || role !== "ROLE_COMPANY") {
                setError("Только компания может редактировать вакансию");
                setLoading(false);
                return;
            }

            try {
                const res = await apiFetch(`/api/vacancy/${id}`, {
                    method: "GET",
                    headers: {
                        "X_User_Login": login,
                        "X_User_Role": role,
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Ошибка загрузки вакансии");
                }

                const data = await res.json();
                if (cancelled) return;

                setTitle(data.title || "");
                setIncomeLevel(data.incomeLevel || "");
                setBusy(data.busy || "");
                setExperience(
                    data.experience !== null && data.experience !== undefined
                        ? String(data.experience)
                        : ""
                );
                setWorkSchedule(data.workSchedule || "");
                setWorkingHours(
                    data.workingHours !== null && data.workingHours !== undefined
                        ? String(data.workingHours)
                        : ""
                );
                setWorkType(data.workType || "");
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
    }, [id, login, role, user]);

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

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            if (incomeLevel) formData.append("incomeLevel", incomeLevel);
            formData.append("busy", busy);
            if (experience) formData.append("experience", experience);
            formData.append("workSchedule", workSchedule);
            if (workingHours) formData.append("workingHours", workingHours);
            formData.append("workType", workType);

            const res = await apiFetch(`/api/vacancy/${id}`, {
                method: "PUT",
                headers: {
                    "X_User_Login": login,
                    "X_User_Role": role,
                },
                body: formData, // title, incomeLevel, busy, experience, workSchedule, workingHours, workType
            });

            if (!res.ok) {
                // 🔥 вот тут вытаскиваем всё, что есть
                let message = `Ошибка обновления вакансии (status ${res.status})`;
                try {
                    const text = await res.text();
                    console.log("Update vacancy error raw response:", text);
                    if (text) {
                        message = text; // пусть даже это HTML/JSON — главное, увидим
                    }
                } catch (e) {
                    console.error("Failed to read error body", e);
                }
                throw new Error(message);
            }

            await res.json();
            navigate(`/vacancies/${id}`);
        } catch (err) {
            console.error("Update vacancy failed:", err);
            setError(err.message || "Не удалось сохранить изменения");
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">EDIT VACANCY</h1>
                        <p className="emp-profile-text">Загрузка...</p>
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
                <section className="emp-card">
                    <h1 className="emp-title">EDIT VACANCY</h1>
                    <p className="emp-profile-text">
                        Обновите основную информацию по вакансии.
                    </p>

                    {error && <div className="emp-error">{error}</div>}

                    <form className="emp-form" onSubmit={handleSubmit}>
                        <div className="emp-row">
                            <input
                                type="text"
                                className="emp-input"
                                placeholder="Название вакансии"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="emp-row">
                            <input
                                type="text"
                                className="emp-input"
                                placeholder="Уровень дохода"
                                value={incomeLevel}
                                onChange={(e) => setIncomeLevel(e.target.value)}
                            />
                        </div>

                        <div className="emp-profile-text" style={{ marginTop: 10 }}>
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

                        <div className="emp-row">
                            <input
                                type="number"
                                min="0"
                                className="emp-input"
                                placeholder="Опыт (лет)"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                            />
                        </div>

                        <div className="emp-row">
                            <input
                                type="number"
                                min="0"
                                className="emp-input"
                                placeholder="Часы в день"
                                value={workingHours}
                                onChange={(e) => setWorkingHours(e.target.value)}
                            />
                        </div>

                        <div className="emp-profile-text" style={{ marginTop: 10 }}>
                            График работы:
                        </div>
                        <div className="emp-grid">
                            {workScheduleOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "emp-tile" +
                                        (workSchedule === opt.value
                                            ? " emp-tile--active"
                                            : "")
                                    }
                                    onClick={() => setWorkSchedule(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="emp-profile-text" style={{ marginTop: 10 }}>
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
                            disabled={saving}
                        >
                            {saving ? "Сохранение..." : "Сохранить и вернуться к вакансии"}
                        </button>
                    </form>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyVacancyEditBasic;
