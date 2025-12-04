import React, { useState } from "react";
import Header from "../../../components/layout/Header";
import "./EmployeePage.css";
import { useNavigate, useLocation } from "react-router-dom";

const EmployeeUploadResume = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // режим: регистрация или редактирование
    const params = new URLSearchParams(location.search);
    const isRegisterFlow = params.get("flow") === "register";

    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0] || null);
        setError("");
    };

    const onSubmit = async () => {
        if (!file) {
            setError("Пожалуйста, выберите файл резюме");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(
                "http://localhost:8080/api/profile/employee/set-resume",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`, // ВАЖНО: без Content-Type
                    },
                    body: formData,
                }
            );

            const text = await res.text();
            console.log("set-resume:", res.status, text);

            if (!res.ok) {
                setError(text || "Ошибка загрузки резюме");
                setLoading(false);
                return;
            }

            // резюме успешно загружено → идём на шаг с фото
            setLoading(false);
            if (isRegisterFlow) {
                // продолжаем воронку регистрации
                navigate("/profile/employee/upload-photo?flow=register");
            } else {
                // редактирование из профиля → назад в профиль
                navigate("/profile");
            }
        } catch (e) {
            console.error(e);
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
                    <h1 className="emp-title">UPLOAD RESUME</h1>

                    <div className="emp-form">
                        <p style={{ color: "#fff", fontSize: 14, marginBottom: 8 }}>
                            Загрузите PDF или другой файл с резюме.
                        </p>

                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                            className="emp-input emp-input--file"
                            onChange={onFileChange}
                        />

                        {file && (
                            <p style={{ color: "#fff", fontSize: 12, marginTop: 6 }}>
                                Выбран файл: {file.name}
                            </p>
                        )}

                        {error && (
                            <div className="emp-error" style={{ marginTop: 8 }}>
                                {error}
                            </div>
                        )}

                        <button
                            className="emp-btn"
                            onClick={onSubmit}
                            disabled={loading}
                        >
                            {loading ? "Uploading..." : "Continue"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EmployeeUploadResume;
