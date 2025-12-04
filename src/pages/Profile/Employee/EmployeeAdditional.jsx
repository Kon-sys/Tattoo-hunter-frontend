import React, { useState } from "react";
import "./EmployeePage.css";
import Header from "../../../components/layout/Header";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:8080/api/profile/employee/additional-info";

const EmployeeAdditional = () => {
    const nav = useNavigate();
    const location = useLocation();

    // режим: регистрация или редактирование
    const params = new URLSearchParams(location.search);
    const isRegisterFlow = params.get("flow") === "register";

    const [addInfo, setAddInfo] = useState("");
    const [error, setError] = useState("");

    const save = async (e) => {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");

        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ addInfo })
        });

        if (!res.ok) {
            setError("Ошибка сохранения");
            return;
        }
        if (isRegisterFlow) {
            // продолжаем воронку регистрации
            nav("/profile/employee/upload-resume?flow=register");
        } else {
            // редактирование из профиля → назад в профиль
            nav("/profile");
        }
    };

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card">

                    <h1 className="emp-title">ABOUT YOU</h1>

                    <form className="emp-form" onSubmit={save}>
                        <textarea
                            className="emp-input emp-textarea"
                            placeholder="Расскажите о себе..."
                            value={addInfo}
                            onChange={e=>setAddInfo(e.target.value)}
                        />

                        {error && <div className="emp-error">{error}</div>}

                        <button className="emp-btn">Continue</button>
                    </form>

                </section>
            </div>
        </div>
    );
};

export default EmployeeAdditional;
