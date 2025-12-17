"use client"

import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../../components/layout/Header"
import "./ChatPage.css"
import { apiFetch } from "../../api/apiClient"
import Footer from "../../components/layout/Footer";

const ChatListPage = () => {
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    let user = null
    try {
        const stored = localStorage.getItem("th_user")
        user = stored ? JSON.parse(stored) : null
    } catch (e) {
        console.error("Cannot parse th_user", e)
    }

    const role = user?.role
    const login = user?.login

    useEffect(() => {
        let cancelled = false

        const loadChats = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                let res

                if (role === "ROLE_EMPLOYEE") {
                    res = await apiFetch("/api/chats/employee", {
                        method: "GET",
                        headers: {
                            "X-User-Login": login,
                        },
                    })
                } else if (role === "ROLE_COMPANY") {
                    const vacRes = await apiFetch("/api/vacancy/company", {
                        method: "GET",
                        headers: {
                            X_User_Login: login,
                            X_User_Role: role,
                        },
                    })

                    if (!vacRes.ok) {
                        const txt = await vacRes.text()
                        throw new Error(txt || "Не удалось загрузить вакансии компании")
                    }

                    const vacancies = await vacRes.json()
                    if (!Array.isArray(vacancies) || vacancies.length === 0) {
                        throw new Error("У компании нет вакансий — чатов пока нет.")
                    }

                    const companyId = vacancies[0].companyId
                    if (!companyId) {
                        throw new Error("Не удалось определить companyId")
                    }

                    res = await apiFetch(`/api/chats/company?companyId=${companyId}`, {
                        method: "GET",
                        headers: {
                            "X-User-Login": login,
                        },
                    })
                } else {
                    setLoading(false)
                    return
                }

                if (!res.ok) {
                    const txt = await res.text()
                    throw new Error(txt || "Не удалось загрузить чаты")
                }

                const data = await res.json()

                if (!cancelled) {
                    setChats(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                console.error(err)
                if (!cancelled) {
                    setError(err.message || "Ошибка загрузки чатов")
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadChats()

        return () => {
            cancelled = true
        }
    }, [login, role])

    const handleProfileClick = (chatData) => {
        if (role === "ROLE_EMPLOYEE") {
            navigate(`/profile/employee/view/${chatData.companyId}`)
        } else if (role === "ROLE_COMPANY") {
            navigate(`/profile/company/view/${chatData.employeeLogin}`)
        }
    }

    if (!user) {
        return (
            <div className="chat-page">
                <div className="chat-bg" />
                <Header />
                <div className="chat-content">
                    <div className="chat-card">
                        <h1 className="chat-title">МОИ ЧАТЫ</h1>
                        <p className="chat-empty">Для доступа к чатам нужно войти в систему.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="chat-page">
            <div className="chat-bg" />
            <Header />
            <div className="chat-content">
                <div className="chat-card">
                    <h1 className="chat-title">МОИ ЧАТЫ</h1>

                    {loading && <p className="chat-loading">Загрузка...</p>}
                    {error && <p className="chat-error">{error}</p>}

                    {!loading && !error && chats.length === 0 && <p className="chat-empty">Чатов пока нет.</p>}

                    <div className="chat-list-grid">
                        {chats.map((c) => {
                            const displayName =
                                role === "ROLE_EMPLOYEE"
                                    ? c.companyName || `Компания #${c.companyId}`
                                    : c.employeeName || c.employeeLogin || "Соискатель"

                            const vacancyLine = c.vacancyName
                                ? `Вакансия: ${c.vacancyName}`
                                : c.vacancyId
                                    ? `Вакансия: #${c.vacancyId}`
                                    : "Без вакансии"

                            return (
                                <div key={c.id} className="chat-list-item">
                                    <div className="chat-list-header">
                                        <div
                                            className="chat-list-avatar"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleProfileClick(c)
                                            }}
                                            title="Перейти к профилю"
                                        >
                                            <span>{displayName[0]?.toUpperCase() || "?"}</span>
                                        </div>

                                        <div className="chat-list-info">
                                            <h3 className="chat-list-name">{displayName}</h3>
                                            {c.vacancyId ? (
                                                <Link
                                                    to={`/vacancies/${c.vacancyId}`}
                                                    className="chat-list-vacancy"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {vacancyLine}
                                                </Link>
                                            ) : (
                                                <p className="chat-list-vacancy">{vacancyLine}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Link to={`/chats/${c.id}`} className="chat-list-link">
                                        Открыть чат →
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ChatListPage
