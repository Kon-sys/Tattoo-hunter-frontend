import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginRegister/LoginPage";
import RegisterPage from "./pages/LoginRegister/RegisterPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* заглушки для будущих роутов */}
            <Route path="/company/vacancies/new" element={<div>New vacancy</div>} />
            <Route path="/company/vacancies" element={<div>Your vacancies</div>} />
            <Route path="/company/employees" element={<div>All workers</div>} />
            <Route path="/vacancies" element={<div>Vacancies list</div>} />
            <Route path="/employee/responses" element={<div>Your responses</div>} />
            <Route path="/chat" element={<div>Chat page</div>} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
    );
};

export default App;
