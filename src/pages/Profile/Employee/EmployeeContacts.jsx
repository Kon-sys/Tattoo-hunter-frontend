import React, { useState } from "react";
import Header from "../../../components/layout/Header";
import "./EmployeePage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../../../api/apiClient";

const API = "http://localhost:8080/api/profile/employee/contact-details";

const EmployeeContacts = () => {
    const nav = useNavigate();
    const location = useLocation();

    // режим: регистрация или редактирование
    const params = new URLSearchParams(location.search);
    const isRegisterFlow = params.get("flow") === "register";

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [telegram, setTelegram] = useState("");

    const [error, setError] = useState("");

    const save = async (e) => {
        e.preventDefault();
        setError("");

        if (!phone || !email) {
            setError("Введите телефон и email");
            return;
        }

        const token = localStorage.getItem("token");
        const fd = new FormData();
        fd.append("phone", phone);
        fd.append("email", email);
        fd.append("telegram", telegram);

        const res = await fetch(API, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });

        if (!res.ok) {
            setError("Ошибка сохранения");
            return;
        }

        if (isRegisterFlow) {
            // продолжаем воронку регистрации
            nav("/profile/employee/additional?flow=register");
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
                    <h1 className="emp-title">CONTACTS</h1>

                    <form className="emp-form" onSubmit={save}>

                        <input className="emp-input" placeholder="Phone"
                               value={phone} onChange={e=>setPhone(e.target.value)} />

                        <input className="emp-input" placeholder="Email"
                               value={email} onChange={e=>setEmail(e.target.value)} />

                        <input className="emp-input" placeholder="Telegram"
                               value={telegram} onChange={e=>setTelegram(e.target.value)} />

                        {error && <div className="emp-error">{error}</div>}

                        <button className="emp-btn">Continue</button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default EmployeeContacts;
