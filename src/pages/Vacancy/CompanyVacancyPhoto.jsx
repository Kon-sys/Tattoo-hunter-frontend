import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";


const CompanyVacancyPhoto = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const vacancyId = localStorage.getItem("th_current_vacancy_id");

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!vacancyId) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">VACANCY PHOTO</h1>
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

        if (!file) {
            setError("Выберите файл для загрузки");
            return;
        }

        if (!token) {
            setError("Отсутствует токен авторизации. Перезайдите в систему.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiFetch(`/api/vacancy/listing-photo/${vacancyId}`, {
                method: "POST",
                headers: {
                    "X_User_Role": "ROLE_COMPANY",
                },
                body: formData, // с файлом
            });

            if (!res.ok) {
                let message = "Ошибка при загрузке обложки вакансии";

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

            await res.json();

            setLoading(false);
            // можно очистить текущую вакансию
            localStorage.removeItem("th_current_vacancy_id");

            // редирект, куда тебе удобнее:
            // например, на список вакансий компании
            navigate("/vacancies");
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
                    <h1 className="emp-title">VACANCY PHOTO</h1>
                    <p className="emp-profile-text">
                        Шаг 3 из 3 — загрузите обложку (листинг-фото) вакансии.
                    </p>

                    {error && <div className="emp-error">{error}</div>}

                    <form className="emp-form" onSubmit={handleSubmit}>
                        <div className="emp-row">
                            <input
                                type="file"
                                accept="application/pdf,image/*"
                                className="emp-input emp-input--file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="emp-btn"
                            disabled={loading}
                        >
                            {loading ? "Загрузка..." : "Завершить"}
                        </button>
                    </form>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyVacancyPhoto;
