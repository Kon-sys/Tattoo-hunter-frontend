import React from "react";
import "./HomePage/HomePage.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import valuesImg from "../assets/about-values.jpg"; // ← сюда подставится твоя картинка

const About = () => {
    return (
        <div className="th-page">
            <Header />

            <main className="th-main">
                <section className="th-static-page">
                    <div className="th-static-inner">
                        <h1 className="th-static-title">About Tattoo Hunter</h1>
                        <p className="th-static-subtitle">
                            Tattoo Hunter — платформа, которая соединяет тату-мастеров,
                            студии и кандидатов в одной экосистеме. Мы делаем поиск работы и
                            сотрудников в тату-индустрии простым, прозрачным и современным.
                        </p>

                        <div className="th-static-grid">
                            <div className="th-static-card">
                                <h3>Для мастеров</h3>
                                <p>
                                    Создавайте портфолио, отмечайте свои стили и опыт, получайте
                                    отклики от студий и клиентов, участвуйте в проектах и
                                    коллаборациях.
                                </p>
                            </div>
                            <div className="th-static-card">
                                <h3>Для студий</h3>
                                <p>
                                    Публикуйте вакансии, ищите мастеров по стилю, опыту и рейтингу,
                                    управляйте откликами и формируйте сильную команду.
                                </p>
                            </div>
                            <div className="th-static-card">
                                <h3>Для индустрии</h3>
                                <p>
                                    Мы создаём прозрачный рынок труда, где талант и профессионализм
                                    важнее связей. Цифровая платформа вместо бесконечных чатов.
                                </p>
                            </div>
                        </div>

                        {/* МИССИЯ + ЦЕННОСТИ слева, большая фотка справа */}
                        <div className="th-mission-values">
                            <div className="th-mission-values-left">
                                <div className="th-static-block">
                                    <h2>Наша миссия</h2>
                                    <p className="th-static-text-lg">
                                        Сделать карьеру в тату-индустрии такой же структурированной и понятной,
                                        как в IT или классическом бизнесе. Помочь мастерам находить свои
                                        “идеальные” студии, а студиям — своих людей, не теряться в бесконечных
                                        чатах и рекомендациях “по знакомству”.
                                    </p>
                                </div>

                                <div className="th-static-block">
                                    <h2>Ценности</h2>
                                    <ul className="th-static-list th-static-text-lg">
                                        <li>Честность и прозрачность в найме;</li>
                                        <li>Поддержка талантливых мастеров и учеников на старте;</li>
                                        <li>Уважение к культуре тату и её разнообразию;</li>
                                        <li>Безопасная коммуникация между мастерами и студиями;</li>
                                        <li>
                                            Фокус на долгосрочном сотрудничестве, а не на разовых “подработках”.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="th-mission-values-image">
                                <img
                                    src={valuesImg}
                                    alt="Tattoo Hunter values"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
