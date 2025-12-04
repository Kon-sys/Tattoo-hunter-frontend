import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const CompanyVacancyAdditional = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const vacancyId = localStorage.getItem("th_current_vacancy_id");

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!vacancyId) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">VACANCY INFO</h1>
                        <p className="emp-profile-text">
                            Не найден ID вакансии. Вернитесь к шагу создания вакансии.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!text) {
            setError("Добавьте описание вакансии");
            return;
        }

        if (!token) {
            setError("Отсутствует токен авторизации. Перезайдите в систему.");
            return;
        }

        setLoading(true);

        try {

            const res = await apiFetch(`/api/vacancy/additional-info/${vacancyId}`, {
                method: "POST",
                headers: {
                    "X_User_Role": "ROLE_COMPANY",
                    "Content-Type": "text/plain; charset=utf-8",
                },
                body: text,
            });


            if (!res.ok) {
                let message = "Ошибка при сохранении описания вакансии";

                try {
                    const data = await res.json();
                    if (data && data.message) {
                        message = data.message;
                    }
                } catch {
                    const t = await res.text();
                    if (t) message = t;
                }

                setError(message);
                setLoading(false);
                return;
            }

            // можно прочитать dto, но нам не обязательно
            await res.json();

            setLoading(false);
            navigate("/company/vacancies/new/photo");
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
                    <h1 className="emp-title">VACANCY INFO</h1>
                    <p className="emp-profile-text">
                        Шаг 2 из 3 — подробное описание вакансии.
                    </p>

                    {error && <div className="emp-error">{error}</div>}

                    <form className="emp-form" onSubmit={handleSubmit}>
                        <div className="emp-row">
                            <textarea
                                className="emp-input emp-textarea"
                                placeholder="Опишите обязанности, требования, условия, команду, бонусы и т.д."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="emp-btn"
                            disabled={loading}
                        >
                            {loading ? "Сохранение..." : "Продолжить"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default CompanyVacancyAdditional;
