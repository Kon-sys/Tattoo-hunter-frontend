// src/pages/Chat/ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";
import { apiFetch } from "../../api/apiClient";

const ChatPage = () => {
    const { chatId } = useParams();

    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newText, setNewText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const bottomRef = useRef(null);

    // 1. Один раз читаем th_user из localStorage и кладём в state
    useEffect(() => {
        try {
            const stored = localStorage.getItem("th_user");
            setUser(stored ? JSON.parse(stored) : null);
        } catch (e) {
            console.error("Cannot parse th_user", e);
            setUser(null);
        }
    }, []);

    const login = user?.login;

    // 2. Общая функция загрузки сообщений
    const loadMessages = async () => {
        if (!login) {
            setLoading(false);
            return;
        }

        try {
            setError("");
            const res = await apiFetch(`/api/chats/${chatId}/messages`, {
                method: "GET",
                headers: {
                    "X-User-Login": login,
                },
            });

            console.log("GET /api/chats/" + chatId + "/messages status =", res.status);

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Не удалось загрузить сообщения");
            }

            const data = await res.json();
            console.log("messages json:", data);

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("load messages error", err);
            setError(err.message || "Ошибка загрузки чата");
        } finally {
            setLoading(false);
        }
    };

    // 3. Грузим сообщения, когда:
    //    - появился user.login
    //    - сменился chatId
    useEffect(() => {
        if (!chatId || !login) return;
        setLoading(true);
        loadMessages();
    }, [chatId, login]);

    // 4. Скроллим вниз при изменении messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;
        if (!login) return;

        try {
            setError("");

            const res = await apiFetch(`/api/chats/${chatId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Login": login,
                },
                body: JSON.stringify({ text: newText.trim() }),
            });

            console.log("POST /api/chats/" + chatId + "/messages status =", res.status);

            if (!res.ok) {
                const txt = await res.text();
                console.error("send error body:", txt);
                setError("Не удалось отправить сообщение");
                return;
            }

            // можно взять только что созданное сообщение,
            // но надёжнее сразу перечитать весь чат с бэка
            setNewText("");
            await loadMessages();
        } catch (err) {
            console.error("send error:", err);
            setError("Ошибка при отправке сообщения");
        }
    };

    if (!user) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">CHAT #{chatId}</h1>
                        <p className="emp-profile-text">
                            Для доступа к чату нужно войти в систему.
                        </p>
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
                <section
                    className="emp-card emp-card--profile"
                    style={{ width: "min(700px, 90vw)" }}
                >
                    <h1 className="emp-title">CHAT #{chatId}</h1>

                    {loading && <p className="emp-profile-text">Загрузка...</p>}
                    {error && <p className="emp-error">{error}</p>}

                    <div
                        style={{
                            flex: 1,
                            minHeight: "300px",
                            maxHeight: "400px",
                            overflowY: "auto",
                            padding: "12px",
                            marginBottom: "12px",
                            background: "rgba(0,0,0,0.3)",
                            borderRadius: "16px",
                        }}
                    >
                        {messages.map((m) => {
                            const mine = m.senderLogin === login;
                            return (
                                <div
                                    key={m.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: mine ? "flex-end" : "flex-start",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: "70%",
                                            padding: "8px 12px",
                                            borderRadius: "16px",
                                            background: mine
                                                ? "#4c1111"
                                                : "rgba(255,255,255,0.1)",
                                            color: "#fff",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                opacity: 0.75,
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {m.senderLogin} ({m.senderRole})
                                        </div>
                                        <div>{m.text}</div>
                                        {m.createdAt && (
                                            <div
                                                style={{
                                                    fontSize: "10px",
                                                    opacity: 0.6,
                                                    marginTop: "2px",
                                                    textAlign: "right",
                                                }}
                                            >
                                                {new Date(m.createdAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <form
                        onSubmit={handleSend}
                        style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                    >
                        <input
                            type="text"
                            className="emp-input"
                            placeholder="Введите сообщение..."
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        />
                        <button type="submit" className="emp-btn emp-btn--small">
                            Отправить
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default ChatPage;
