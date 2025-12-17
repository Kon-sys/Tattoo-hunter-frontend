"use client"

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer";
import "./EmployeeResponsesPage.css"
import { apiFetch } from "../../api/apiClient"

const EmployeeResponsesPage = () => {
    const [responses, setResponses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

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

        const load = async () => {
            if (!login || role !== "ROLE_EMPLOYEE") {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError("")

                const res = await apiFetch("/api/responses/employee", {
                    method: "GET",
                })

                if (!res.ok) {
                    const text = await res.text()
                    throw new Error(text || "Ошибка загрузки откликов")
                }

                const data = await res.json()
                if (!cancelled) {
                    setResponses(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                console.error(err)
                if (!cancelled) setError("Не удалось загрузить отклики")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [login, role])

    const getStatusClass = (status) => {
        const statusLower = status?.toLowerCase() || ""
        if (statusLower === "pending") return "response-status--pending"
        if (statusLower === "approved" || statusLower === "accepted") return "response-status--approved"
        if (statusLower === "rejected") return "response-status--rejected"
        return "response-status--pending"
    }

    const getStatusText = (status) => {
        const statusLower = status?.toLowerCase() || ""
        if (statusLower === "pending") return "На рассмотрении"
        if (statusLower === "approved" || statusLower === "accepted") return "Одобрено"
        if (statusLower === "rejected") return "Отклонено"
        return status || "Неизвестно"
    }

    return (
        <div className="responses-page">
            <div className="responses-bg" />
            <Header />

            <div className="responses-container">
                <div className="responses-header">
                    <h1 className="responses-title">Мои отклики</h1>
                    {role === "ROLE_EMPLOYEE" && (
                        <p className="responses-subtitle">Отслеживайте статус ваших откликов на вакансии</p>
                    )}
                </div>

                {role !== "ROLE_EMPLOYEE" && <div className="responses-error">Страница доступна только для работников.</div>}

                {role === "ROLE_EMPLOYEE" && (
                    <>
                        {loading && <div className="responses-loading">Загрузка откликов...</div>}

                        {error && <div className="responses-error">{error}</div>}

                        {!loading && !error && responses.length === 0 && (
                            <div className="responses-empty">
                                Вы ещё не откликались ни на одну вакансию.
                                <br />
                                <Link to="/vacancies" style={{ color: "#8b5cf6", marginTop: "12px", display: "inline-block" }}>
                                    Перейти к поиску вакансий →
                                </Link>
                            </div>
                        )}

                        {!loading && !error && responses.length > 0 && (
                            <div className="responses-grid">
                                {responses.map((r) => (
                                    <div key={r.id} className="response-card">
                                        <div className="response-card-header">
                                            <div className="response-card-info">
                                                <h3 className="response-vacancy-title">Вакансия #{r.vacancyId}</h3>

                                                <div className="response-detail">
                                                    <span className="response-detail-label">Компания:</span>
                                                    <span className="response-detail-value">ID {r.companyId}</span>
                                                </div>

                                                <div>
                          <span className={`response-status ${getStatusClass(r.status)}`}>
                            {getStatusText(r.status)}
                          </span>
                                                </div>

                                                {r.createdAt && (
                                                    <div className="response-date">
                                                        <svg className="response-date-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        {new Date(r.createdAt).toLocaleDateString("ru-RU", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {r.vacancyId && (
                                                <Link to={`/vacancies/${r.vacancyId}`} className="response-link">
                                                    Перейти к вакансии
                                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default EmployeeResponsesPage
