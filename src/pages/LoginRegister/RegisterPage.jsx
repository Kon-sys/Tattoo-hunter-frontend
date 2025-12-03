import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import Header from "../../components/layout/Header";
import { parseJwt } from "../../api/jwt";


const RegisterPage = () => {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(null); // по умолчанию работник
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8080/api/auth/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login,
                    password,
                    role, // ROLE_EMPLOYEE или ROLE_COMPANY
                }),
            });

            if (!res.ok) {
                // попытаемся вытащить текст ошибки с бэка
                const text = await res.text();
                if (text && text.includes("already exists")) {
                    setError("Пользователь с таким логином уже существует");
                } else if (text && text.includes("Заполните все поля")) {
                    setError("Заполните все поля");
                }
                else if (text && text.includes("Login cannot be empty")) {
                    setError("Логин не может быть пустым");
                }
                else if (text && text.includes("Password cannot be empty")) {
                    setError("Пароль не может быть пустым");
                }
                else if (text && text.includes("Choose your role")) {
                    setError("Выберите роль");
                }
                else {
                    setError("Ошибка при регистрации");
                }
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log("Sign-up response:", data);

            // JwtAuthenticationDto — такой же, как при sign-in
            // сохраняем токен, чтобы сразу быть залогиненным
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }

            const payload = parseJwt(data.token);

            const thUser = {
                login: payload.sub,
                role: payload.role,
                fullName: payload.sub,
                email: payload.sub,
            };

            localStorage.setItem("th_user", JSON.stringify(thUser));


            setLoading(false);

            // редирект на страницу дополнительной информации в зависимости от роли
            if (role === "ROLE_COMPANY") {
                navigate("/profile/company");
            } else {
                // запустить пошаговый wizard
                navigate("/profile/employee/basic?flow=register");
            }


        } catch (err) {
            console.error(err);
            setError("Ошибка подключения к серверу");
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-page__bg" />

            <Header />

            <div className="register-page__content">
                <section className="register-card">
                    <div className="register-card__header">
                        <h1 className="register-card__title">SIGN UP</h1>
                        <p className="register-card__subtitle">
                            СОЗДАЙТЕ СВОЙ АККАУНТ
                        </p>
                    </div>

                    {/* выбор роли */}
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={
                                "role-toggle__btn" +
                                (role === "ROLE_EMPLOYEE" ? " role-toggle__btn--active" : "")
                            }
                            onClick={() => setRole("ROLE_EMPLOYEE")}
                        >
                            Employee
                        </button>
                        <button
                            type="button"
                            className={
                                "role-toggle__btn" +
                                (role === "ROLE_COMPANY" ? " role-toggle__btn--active" : "")
                            }
                            onClick={() => setRole("ROLE_COMPANY")}
                        >
                            Company
                        </button>
                    </div>

                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-field">
                            <input
                                type="text"
                                name="login"
                                placeholder="Login"
                                className="register-field__input"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                            />
                        </div>

                        <div className="register-field">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="register-field__input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <div className="register-error">{error}</div>}

                        <button
                            type="submit"
                            className="register-form__submit"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "SIGN UP"}
                        </button>
                    </form>

                    <p className="register-card__bottom">
                        <span className="register-card__bottom-text">
                            Already have an account?
                        </span>{" "}
                        <Link to="/login" className="register-card__bottom-link">
                            Sign in
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default RegisterPage;
