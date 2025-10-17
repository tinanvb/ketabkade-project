"use client";
import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const mode = hour >= 17 || hour < 6;
    setDarkMode(mode);
    document.body.classList.toggle("dark-mode", mode);
    document.querySelectorAll(".admin-container").forEach((el) =>
      el.classList.toggle("dark-mode", mode)
    );
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;

      document.body.classList.toggle("dark-mode", newMode);
      document.querySelectorAll(".admin-container").forEach((el) =>
        el.classList.toggle("dark-mode", newMode)
      );

      return newMode;
    });
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
