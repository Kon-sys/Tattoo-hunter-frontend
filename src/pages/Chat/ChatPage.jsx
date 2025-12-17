"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../../components/layout/Header"
import "./ChatPage.css"
import { apiFetch } from "../../api/apiClient"
import Footer from "../../components/layout/Footer";

const ChatPage = () => {
    const { chatId } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [newText, setNewText] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [chatInfo, setChatInfo] = useState(null)
    const [vacancyInfo, setVacancyInfo] = useState(null)

    const bottomRef = useRef(null)

    useEffect(() => {
        try {
            const stored = localStorage.getItem("th_user")
            setUser(stored ? JSON.parse(stored) : null)
        } catch (e) {
            console.error("Cannot parse th_user", e)
            setUser(null)
        }
    }, [])

    const login = user?.login
    const role = user?.role

    const loadMessages = async () => {
        if (!login) {
            setLoading(false)
            return
        }

        try {
            setError("")

            // 1) сообщения (теперь в каждом есть senderName + senderRole)
            const res = await apiFetch(`/api/chats/${chatId}/messages`, {
                method: "GET",
                headers: {
                    "X-User-Login": login,
                },
            })

            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || "Не удалось загрузить сообщения")
            }

            const data = await res.json()
            const list = Array.isArray(data) ? data : []
            setMessages(list)

            // 2) определяем собеседника по сообщениям
            if (list.length > 0) {
                const otherMsg = list.find((m) => m.senderLogin !== login)

                setChatInfo((prev) => ({
                    ...prev,
                    otherUserLogin: otherMsg?.senderLogin || null,
                    otherUserRole: otherMsg?.senderRole || null,
                    otherUserName: otherMsg?.senderName || otherMsg?.senderLogin || null,
                }))
            }

            // 3) чат-мета (companyId/vacancyId) — если этот эндпоинт у тебя реально есть
            const chatRes = await apiFetch(`/api/chats/${chatId}`, {
                method: "GET",
                headers: {
                    "X-User-Login": login,
                },
            })

            if (chatRes.ok) {
                const chatData = await chatRes.json()

                // vacancy title
                if (chatData.vacancyId) {
                    try {
                        // у тебя вакансии в listing обычно через /api/vacancies/:id
                        const vRes = await apiFetch(`/api/vacancies/${chatData.vacancyId}`, { method: "GET" })
                        if (vRes.ok) {
                            const v = await vRes.json()
                            setVacancyInfo({
                                id: chatData.vacancyId,
                                title: v.title || `Вакансия #${chatData.vacancyId}`,
                            })
                        } else {
                            setVacancyInfo({
                                id: chatData.vacancyId,
                                title: `Вакансия #${chatData.vacancyId}`,
                            })
                        }
                    } catch (e) {
                        setVacancyInfo({
                            id: chatData.vacancyId,
                            title: `Вакансия #${chatData.vacancyId}`,
                        })
                    }
                } else {
                    setVacancyInfo(null)
                }

                // company name for employee header (если у тебя есть /api/company/:id)
                if (role === "EMPLOYEE" && chatData.companyId) {
                    try {
                        const compRes = await apiFetch(`/api/company/${chatData.companyId}`, { method: "GET" })
                        if (compRes.ok) {
                            const company = await compRes.json()
                            setChatInfo((prev) => ({
                                ...prev,
                                companyId: chatData.companyId,
                                companyName: company.companyName || company.name || `Компания #${chatData.companyId}`,
                            }))
                        } else {
                            setChatInfo((prev) => ({
                                ...prev,
                                companyId: chatData.companyId,
                                companyName: `Компания #${chatData.companyId}`,
                            }))
                        }
                    } catch (e) {
                        setChatInfo((prev) => ({
                            ...prev,
                            companyId: chatData.companyId,
                            companyName: `Компания #${chatData.companyId}`,
                        }))
                    }
                } else if (chatData.companyId) {
                    // чтобы employee мог кликнуть на компанию даже если имя не загрузилось
                    setChatInfo((prev) => ({
                        ...prev,
                        companyId: prev?.companyId ?? chatData.companyId,
                    }))
                }
            }
        } catch (err) {
            console.error("load messages error", err)
            setError(err.message || "Ошибка загрузки чата")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!chatId || !login) return
        setLoading(true)
        loadMessages()
    }, [chatId, login])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newText.trim()) return
        if (!login) return

        try {
            setError("")

            const res = await apiFetch(`/api/chats/${chatId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Login": login,
                },
                body: JSON.stringify({ text: newText.trim() }),
            })

            if (!res.ok) {
                const txt = await res.text()
                console.error("send error body:", txt)
                setError("Не удалось отправить сообщение")
                return
            }

            setNewText("")
            await loadMessages()
        } catch (err) {
            console.error("send error:", err)
            setError("Ошибка при отправке сообщения")
        }
    }

    // ✅ ПОД ТВОИ РОУТЫ:
    // /profile/employee/view/:id  -> CompanyProfilePage (companyId)
    // /profile/company/view/:login -> EmployeeProfilePage (employeeLogin)
    const handleAvatarClick = () => {
        if (!chatInfo) return

        // работник открывает компанию: /profile/employee/view/:id (CompanyProfilePage)
        if (role === "ROLE_EMPLOYEE") {
            if (chatInfo.companyId) navigate(`/profile/employee/view/${chatInfo.companyId}`)
            return
        }

        // компания открывает работника: /profile/company/view/:login (EmployeeProfilePage)
        if (role === "ROLE_COMPANY") {
            if (chatInfo.otherUserLogin) navigate(`/profile/company/view/${chatInfo.otherUserLogin}`)
        }
    }


    if (!user) {
        return (
            <div className="chat-page">
                <div className="chat-bg" />
                <Header />
                <div className="chat-content">
                    <div className="chat-card">
                        <h1 className="chat-title">ЧАТ #{chatId}</h1>
                        <p className="chat-empty">Для доступа к чату нужно войти в систему.</p>
                    </div>
                </div>
            </div>
        )
    }

    const headerName =
        role === "EMPLOYEE"
            ? (chatInfo?.companyName || "Компания")
            : (chatInfo?.otherUserName || chatInfo?.otherUserLogin || "Работник")

    const avatarLetter = headerName?.[0]?.toUpperCase() || "?"

    return (
        <div className="chat-page">
            <div className="chat-bg" />
            <Header />
            <div className="chat-content">
                <div className="chat-card">
                    <div className="chat-header">
                        <button
                            type="button"
                            className="chat-back-btn"
                            onClick={() => navigate("/chats")}
                            title="Вернуться к списку чатов"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </button>

                        <div
                            className="chat-avatar"
                            onClick={handleAvatarClick}
                            title={chatInfo ? "Перейти к профилю" : "Загрузка..."}
                            style={{cursor: chatInfo ? "pointer" : "default"}}
                        >
                            <span>{avatarLetter}</span>
                        </div>

                        <div className="chat-info">
                            <h1 className="chat-title">{headerName}</h1>
                            <p className="chat-subtitle">
                                {vacancyInfo?.title || (chatInfo?.otherUserRole === "COMPANY" ? "Компания" : "Работник")}
                            </p>
                        </div>
                    </div>


                    {loading && <p className="chat-loading">Загрузка...</p>}
                    {error && <p className="chat-error">{error}</p>}

                    <div className="chat-messages-container">
                        {messages.map((m) => {
                            const mine = m.senderLogin === login
                            return (
                                <div
                                    key={m.id}
                                    className={`chat-message ${mine ? "chat-message--mine" : "chat-message--other"}`}
                                >
                                    <div className="chat-message-bubble">
                                        <div className="chat-message-sender">
                                            {m.senderName || m.senderLogin}
                                            <span className="chat-message-role">
                                                {m.senderRole === "COMPANY" ? "Компания" : "Работник"}
                                            </span>
                                        </div>

                                        <div className="chat-message-text">{m.text}</div>

                                        {m.createdAt && (
                                            <div className="chat-message-time">
                                                {new Date(m.createdAt).toLocaleString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={handleSend} className="chat-input-form">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Введите сообщение..."
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        />
                        <button type="submit" className="chat-btn">
                            Отправить
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ChatPage
