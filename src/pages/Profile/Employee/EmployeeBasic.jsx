import React, { useState } from "react";
import "./EmployeePage.css";
import Header from "../../../components/layout/Header";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../../../api/apiClient";

const EmployeeBasic = () => {
    const nav = useNavigate();
    const location = useLocation();

    // режим: регистрация или редактирование
    const params = new URLSearchParams(location.search);
    const isRegisterFlow = params.get("flow") === "register";

    const [firstName, setFN] = useState("");
    const [lastName, setLN] = useState("");
    const [fatherName, setFather] = useState("");
    const [birthDate, setBD] = useState("");
    const [gender, setGender] = useState("");
    const [city, setCity] = useState("");
    const [experience, setExp] = useState("");

    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!firstName || !lastName || !gender || !birthDate) {
            setError("Заполните обязательные поля");
            return;
        }

        const fd = new FormData();
        fd.append("firstName", firstName);
        fd.append("lastName", lastName);
        fd.append("fatherName", fatherName);
        fd.append("birthDate", birthDate);
        fd.append("gender", gender);
        fd.append("city", city);
        fd.append("experience", experience);

        try {
            const res = await apiFetch("/api/profile/employee", {
                method: "POST",
                body: fd, // без Content-Type, FormData сам
            });

            if (!res.ok) {
                const text = await res.text();
                console.log("employee basic:", res.status, text);
                setError(text || "Ошибка сохранения");
                return;
            }

            // успешное сохранение
            if (isRegisterFlow) {
                // продолжаем воронку регистрации
                nav("/profile/employee/categories?flow=register");
            } else {
                // редактирование из профиля → назад в профиль
                nav("/profile");
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка подключения к серверу");
        }
    };

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card">
                    <h1 className="emp-title">BASIC INFO</h1>

                    <form className="emp-form" onSubmit={submit}>
                        <div className="emp-row">
                            <input
                                className="emp-input"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFN(e.target.value)}
                            />
                            <input
                                className="emp-input"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLN(e.target.value)}
                            />
                        </div>

                        <input
                            className="emp-input"
                            placeholder="Father name"
                            value={fatherName}
                            onChange={(e) => setFather(e.target.value)}
                        />

                        <div className="emp-row">
                            <input
                                type="date"
                                className="emp-input"
                                value={birthDate}
                                onChange={(e) => setBD(e.target.value)}
                            />

                            <select
                                className="emp-input"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>

                        <input
                            className="emp-input"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />

                        <input
                            className="emp-input"
                            placeholder="Experience (years)"
                            value={experience}
                            onChange={(e) => setExp(e.target.value)}
                        />

                        {error && <div className="emp-error">{error}</div>}

                        <button className="emp-btn">Continue</button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default EmployeeBasic;
