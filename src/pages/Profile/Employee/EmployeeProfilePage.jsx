import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/layout/Header";
import "./EmployeePage.css";
import { apiFetch } from "../../../api/apiClient";

const EmployeeProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await apiFetch("/api/profile/employee/me", {
                    method: "GET",
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("load profile:", res.status, text);
                    setError(text || "Не удалось загрузить профиль");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setProfile(data);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError("Ошибка подключения к серверу");
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const formatName = () => {
        if (!profile) return "";
        const parts = [profile.firstName, profile.lastName].filter(Boolean);
        if (parts.length === 0) return "";
        return parts.join(" ");
    };

    const formatCategories = (cats) => {
        if (!cats || !cats.length) return "Не указано";
        return cats
            .map((c) =>
                c
                    .toLowerCase()
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (ch) => ch.toUpperCase())
            )
            .join(", ");
    };

    const onEdit = () => {
        navigate("/profile/employee/edit");
    };

    if (loading) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card">
                        <h1 className="emp-title">PROFILE</h1>
                        <p className="emp-profile-text">Загрузка...</p>
                    </section>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card">
                        <h1 className="emp-title">PROFILE</h1>
                        <p className="emp-profile-text emp-error">{error}</p>
                    </section>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card">
                        <h1 className="emp-title">PROFILE</h1>
                        <p className="emp-profile-text">
                            Профиль сотрудника не найден.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    const name = formatName();
    const avatarUrl = profile.mainPhoto || null;

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <div className="emp-profile-header">
                        <div className="emp-profile-avatar">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" />
                            ) : (
                                <span>
                                    {(profile.firstName?.[0] ||
                                        profile.lastName?.[0] ||
                                        "U"
                                    ).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="emp-profile-main">
                            <h1 className="emp-title">
                                {name || "Без имени"}
                            </h1>
                            <p className="emp-profile-text">
                                {profile.city || "Город не указан"}
                            </p>
                            <p className="emp-profile-text">
                                Опыт:{" "}
                                {profile.experience != null
                                    ? `${profile.experience} лет`
                                    : "не указан"}
                            </p>
                            <button
                                className="emp-btn emp-btn--small"
                                onClick={onEdit}
                            >
                                Edit profile
                            </button>
                        </div>
                    </div>

                    <div className="emp-profile-sections">
                        <div className="emp-profile-block">
                            <h2 className="emp-profile-subtitle">
                                Basic info
                            </h2>
                            <div className="emp-profile-grid">
                                <div>
                                    <div className="emp-label">First name</div>
                                    <div className="emp-value">
                                        {profile.firstName || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Last name</div>
                                    <div className="emp-value">
                                        {profile.lastName || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Father name</div>
                                    <div className="emp-value">
                                        {profile.fatherName || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Birth date</div>
                                    <div className="emp-value">
                                        {profile.birthDate || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Gender</div>
                                    <div className="emp-value">
                                        {profile.gender || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">City</div>
                                    <div className="emp-value">
                                        {profile.city || "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="emp-profile-block">
                            <h2 className="emp-profile-subtitle">
                                Contacts
                            </h2>
                            <div className="emp-profile-grid">
                                <div>
                                    <div className="emp-label">Phone</div>
                                    <div className="emp-value">
                                        {profile.phone || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Email</div>
                                    <div className="emp-value">
                                        {profile.email || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="emp-label">Telegram</div>
                                    <div className="emp-value">
                                        {profile.telegram || "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="emp-profile-block">
                            <h2 className="emp-profile-subtitle">
                                Work categories
                            </h2>
                            <p className="emp-profile-text">
                                {formatCategories(profile.workCategories)}
                            </p>
                        </div>

                        <div className="emp-profile-block">
                            <h2 className="emp-profile-subtitle">
                                Additional info
                            </h2>
                            <p className="emp-profile-text">
                                {profile.addInfo || "—"}
                            </p>
                        </div>

                        <div className="emp-profile-block">
                            <h2 className="emp-profile-subtitle">Resume</h2>
                            {profile.resume ? (
                                <a
                                    href={profile.resume}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="emp-link"
                                >
                                    Открыть резюме
                                </a>
                            ) : (
                                <p className="emp-profile-text">
                                    Резюме не загружено
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EmployeeProfilePage;
