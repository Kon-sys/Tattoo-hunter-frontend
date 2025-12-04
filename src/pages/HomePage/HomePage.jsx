import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import {
    FaBriefcase,
    FaUsers,
    FaBuilding,
} from "react-icons/fa";
import "./HomePage.css";
import logoSkull from "../../assets/logo-skull.png"; // ← твой логотип

const API_BASE_URL = "http://localhost:8080";

const HomePage = () => {
    const navigate = useNavigate();

    const [counters, setCounters] = useState({
        vacancies: 0,
        employees: 0,
        companies: 0,
    });

    const [animatedCounters, setAnimatedCounters] = useState({
        vacancies: 0,
        employees: 0,
        companies: 0,
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("th_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Cannot parse user from localStorage", e);
            }
        }
    }, []);

    const isAuthenticated = !!user;
    const isCompany = user?.role === "COMPANY";
    const isEmployee = user?.role === "EMPLOYEE";

    useEffect(() => {
        const fetchCounters = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/counters`);

                console.log("COUNTERS RESPONSE:", res.data); // ← смотрим, что реально пришло

                // тут подстраиваем названия под твой JSON
                const data = {
                    employees: res.data.employeesCount ?? 0,
                    companies: res.data.companiesCount ?? 0,
                    vacancies: res.data.vacanciesCount ?? 0,
                };

                console.log("PARSED COUNTERS:", data);

                setCounters(data);
                animateCounters(data);
            } catch (error) {
                console.error("ERROR LOADING COUNTERS:", error);
            }
        };

        fetchCounters();
    }, []);

    const animateCounters = (target) => {
        const duration = 1500;
        const fps = 60;
        const totalSteps = Math.round((duration / 1000) * fps);

        let currentStep = 0;
        const start = { vacancies: 0, employees: 0, companies: 0 };

        const interval = setInterval(() => {
            currentStep += 1;
            const progress = Math.min(currentStep / totalSteps, 1);

            setAnimatedCounters({
                vacancies: Math.floor(
                    start.vacancies +
                    (target.vacancies - start.vacancies) * progress
                ),
                employees: Math.floor(
                    start.employees +
                    (target.employees - start.employees) * progress
                ),
                companies: Math.floor(
                    start.companies +
                    (target.companies - start.companies) * progress
                ),
            });

            if (progress >= 1) clearInterval(interval);
        }, 1000 / fps);
    };

    const goHome = () => navigate("/");
    const goAbout = () => navigate("/about");
    const goContact = () => navigate("/contact");
    const goLogin = () => navigate("/login");
    const goRegister = () => navigate("/register");

    const goAddVacancy = () => navigate("/company/vacancies/new");
    const goCompanyVacancies = () => navigate("/company/vacancies");
    const goAllEmployees = () => navigate("/company/employees");
    const goVacancies = () => navigate("/vacancies");
    const goResponses = () => navigate("/employee/responses");
    const goChat = () => navigate("/chat");
    const goProfile = () => navigate("/profile");

    const getAvatarLetter = () =>
        user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

    return (
        <div className="th-page">

            <Header />

            {/* HERO */}
            <main className="th-main">
                <section className="th-hero">
                    <div className="th-hero-overlay"/>

                    {/* новый общий контейнер */}
                    <div className="th-hero-inner">
                        <div className="th-hero-content">
                            <h1 className="th-hero-title">Find Your Dream Job Today!</h1>
                            <p className="th-hero-subtitle">
                                Connecting Tattoo Talent with Opportunities: Your Gateway to Career Success
                            </p>
                        </div>

                        <div className="th-counters">
                            <CounterBubble
                                icon={<FaBriefcase/>}
                                value={animatedCounters.vacancies}
                                label="Jobs"
                            />
                            <CounterBubble
                                icon={<FaUsers/>}
                                value={animatedCounters.employees}
                                label="Candidates"
                            />
                            <CounterBubble
                                icon={<FaBuilding/>}
                                value={animatedCounters.companies}
                                label="Companies"
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

const CounterBubble = ({icon, value, label}) => (
    <div className="th-counter-bubble">
        <div className="th-counter-icon">{icon}</div>
        <div className="th-counter-number">
            {value.toLocaleString("en-US")}
        </div>
        <div className="th-counter-label">{label}</div>
    </div>
);

export default HomePage;
