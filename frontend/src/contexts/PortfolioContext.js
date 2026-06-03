import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    try {
      const { data: d } = await api.get("/portfolio");
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const updateSection = useCallback(async (section, payload) => {
    const { data: d } = await api.put(`/portfolio/section/${section}`, payload);
    setData(d);
    return d;
  }, []);

  const addExperience = useCallback(async (payload) => {
    const { data: d } = await api.post(`/portfolio/experience`, payload);
    setData(d);
  }, []);

  const updateExperience = useCallback(async (id, payload) => {
    const { data: d } = await api.put(`/portfolio/experience/${id}`, payload);
    setData(d);
  }, []);

  const deleteExperience = useCallback(async (id) => {
    const { data: d } = await api.delete(`/portfolio/experience/${id}`);
    setData(d);
  }, []);

  const addProject = useCallback(async (payload) => {
    const { data: d } = await api.post(`/portfolio/projects`, payload);
    setData(d);
  }, []);

  const updateProject = useCallback(async (id, payload) => {
    const { data: d } = await api.put(`/portfolio/projects/${id}`, payload);
    setData(d);
  }, []);

  const deleteProject = useCallback(async (id) => {
    const { data: d } = await api.delete(`/portfolio/projects/${id}`);
    setData(d);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        refresh: fetchPortfolio,
        updateSection,
        addExperience,
        updateExperience,
        deleteExperience,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
