import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const CompanyVacancyEditPhoto = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    let user = null;
    try {
        const stored = localStorage.getItem("th_user");
        user = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Cannot parse th_user", e);
    }

    const role = user?.role;

    const [currentUrl, setCurrentUrl] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!user || role !== "ROLE_COMPANY") {
                setError("Только компания может обновлять обложку вакансии");
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

                setCurrentUrl(data.listUrl || "");
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
    }, [id, role, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!file) {
            setError("Выберите файл для загрузки");
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiFetch(`/api/vacancy/listing-photo/${id}`, {
                method: "POST",
                headers: {
                    "X_User_Role": "ROLE_COMPANY",
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Ошибка загрузки обложки");
            }

            await res.json();
            navigate(`/vacancies/${id}`);
        } catch (err) {
            console.error(err);
            setError("Не удалось обновить обложку");
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
                        <h1 className="emp-title">EDIT PHOTO</h1>
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
                    <h1 className="emp-title">EDIT PHOTO</h1>
                    <p className="emp-profile-text">
                        Обновите обложку вакансии.
                    </p>

                    {error && <div className="emp-error">{error}</div>}

                    {currentUrl && (
                        <div className="emp-profile-block" style={{ marginBottom: 16 }}>
                            <h3 className="emp-profile-subtitle">Текущая обложка</h3>
                            <img
                                src={currentUrl}
                                alt="Current vacancy listing"
                                style={{
                                    maxWidth: "100%",
                                    borderRadius: 16,
                                    maxHeight: 260,
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    )}

                    <form className="emp-form" onSubmit={handleSubmit}>
                        <div className="emp-row">
                            <input
                                type="file"
                                className="emp-input emp-input--file"
                                accept="image/*,application/pdf"
                                onChange={(e) =>
                                    setFile(e.target.files?.[0] || null)
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            className="emp-btn"
                            disabled={saving}
                        >
                            {saving ? "Загрузка..." : "Сохранить и вернуться к вакансии"}
                        </button>
                    </form>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyVacancyEditPhoto;
