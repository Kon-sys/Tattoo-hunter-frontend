// src/pages/Contact.jsx
import React from "react";
import "./HomePage/HomePage.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const Contact = () => {
    return (
        <div className="th-page">
            <Header />

            <main className="th-main">
                <section className="th-static-page">
                    <div className="th-static-inner th-static-inner--contact">
                        <h1 className="th-static-title">Contact Us</h1>
                        <p className="th-static-subtitle">
                            Свяжитесь с командой Tattoo Hunter по вопросам платформы,
                            сотрудничества или техподдержки. Мы внимательно читаем каждое
                            обращение и используем ваш фидбек, чтобы сделать сервис удобнее
                            для тату-мастеров и студий.
                        </p>

                        <div className="th-contact-layout">
                            {/* Левая колонка — блок с контактами */}
                            <div className="th-contact-info">
                                <h3>Основные контакты</h3>
                                <p>
                                    Выберите адрес, который лучше всего подходит под ваш запрос.
                                    Это поможет нам быстрее передать обращение нужной команде.
                                </p>

                                <div className="th-contact-item">
                                    <span className="th-contact-label">General support:</span>
                                    <span className="th-contact-value">
                    support@tattoo-hunter.com
                  </span>
                                </div>

                                <div className="th-contact-item">
                                    <span className="th-contact-label">Для студий и HR:</span>
                                    <span className="th-contact-value">
                    studios@tattoo-hunter.com
                  </span>
                                </div>

                                <div className="th-contact-item">
                                    <span className="th-contact-label">Для мастеров и учеников:</span>
                                    <span className="th-contact-value">
                    artists@tattoo-hunter.com
                  </span>
                                </div>

                                <div className="th-contact-item">
                                    <span className="th-contact-label">Партнёрства и медиа:</span>
                                    <span className="th-contact-value">
                    partners@tattoo-hunter.com
                  </span>
                                </div>
                            </div>

                            {/* Правая колонка — объяснение как писать */}
                            <div className="th-contact-info">
                                <h3>Как составить обращение</h3>
                                <p>
                                    Чтобы мы быстрее разобрались в вопросе, в письме можно кратко
                                    указать, кто вы и чего хотите добиться с помощью Tattoo Hunter.
                                    Это особенно полезно, если вы впервые выходите с нами на связь.
                                </p>

                                <ul className="th-static-list">
                                    <li>
                                        В теме письма укажите тип запроса:
                                        <br />
                                        например, <i>“Bug report”</i>, <i>“Новая студия”</i>,
                                        <i>“Вопрос по откликам”</i> или <i>“Партнёрство”</i>.
                                    </li>
                                    <li>
                                        В тексте письма напишите пару фраз о себе
                                        (тату-мастер, владелец студии, HR и т.д.)
                                        и в каком городе вы работаете.
                                    </li>
                                    <li>
                                        Если обращение связано с профилем или вакансиями —
                                        добавьте ссылку на профиль/студию внутри Tattoo Hunter
                                        или портфолио.
                                    </li>
                                    <li>
                                        Оставьте удобный канал для связи:
                                        почта, Telegram, Instagram или другой мессенджер.
                                    </li>
                                </ul>

                                <p style={{ marginTop: "10px", fontSize: "13px", color: "#8f8f98" }}>
                                    Сейчас мы принимаем обращения только по почте. В следующих
                                    версиях Tattoo Hunter планируем добавить встроенный тикет-центр
                                    и отдельный раздел помощи прямо в личном кабинете.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
