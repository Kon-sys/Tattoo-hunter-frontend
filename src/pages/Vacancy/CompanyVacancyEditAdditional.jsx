// src/pages/Vacancy/CompanyVacancyEditAdditional.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const CompanyVacancyEditAdditional = () => {
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

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!user || role !== "ROLE_COMPANY") {
                setError("Только компания может редактировать описание вакансии");
                setLoading(false);
                return;
            }

            try {
                const res = await apiFetch(`/api/vacancy/${id}`, {
                    method: "GET",
                    headers: {
                        "X_User_Login": user.login,
                        "X_User_Role": role,
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Ошибка загрузки вакансии");
                }

                const data = await res.json();
                if (cancelled) return;

                setText(data.addInfo || "");
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
    }, [id, role, user]); // user здесь уже стабильный (из useState)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!text.trim()) {
            setError("Добавьте описание вакансии");
            return;
        }

        setSaving(true);

        try {
            const res = await apiFetch(`/api/vacancy/additional-info/${id}`, {
                method: "POST",
                headers: {
                    "X_User_Role": "ROLE_COMPANY",
                    "Content-Type": "text/plain; charset=utf-8",
                },
                body: text,
            });

            if (!res.ok) {
                let message = "Ошибка обновления описания";
                try {
                    const data = await res.json();
                    if (data.message) message = data.message;
                } catch {
                    const t = await res.text();
                    if (t) message = t;
                }
                throw new Error(message);
            }

            await res.json();
            navigate(`/vacancies/${id}`);
        } catch (err) {
            console.error(err);
            setError(err.message || "Не удалось сохранить описание");
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
                        <h1 className="emp-title">EDIT DESCRIPTION</h1>
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
                    <h1 className="emp-title">EDIT DESCRIPTION</h1>
                    <p className="emp-profile-text">
                        Обновите текст описания вакансии.
                    </p>

                    {error && <div className="emp-error">{error}</div>}

                    <form className="emp-form" onSubmit={handleSubmit}>
                        <div className="emp-row">
                            <textarea
                                className="emp-input emp-textarea"
                                placeholder="Описание вакансии"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
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

export default CompanyVacancyEditAdditional;
