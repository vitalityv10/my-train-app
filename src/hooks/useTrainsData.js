import { useState, useEffect } from "react";
import { initialTrainsData, getAllCities } from "../data/trains";
import { apiFetch } from "../api/apiClient";

export function useTrainsData() {
  const [trains, setTrains] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTrains = async () => {
      try {
        const [trainsData, citiesData] = await Promise.all([
          apiFetch("/api/trains"),
          apiFetch("/api/trains/cities").catch(() => null),
        ]);

        if (!isMounted) return;

        const resolvedTrains =
          Array.isArray(trainsData) && trainsData.length > 0
            ? trainsData
            : initialTrainsData;

        setTrains(resolvedTrains);
        setCities(
          Array.isArray(citiesData) && citiesData.length > 0
            ? citiesData
            : getAllCities(resolvedTrains),
        );
      } catch (error) {
        console.error("Error fetching trains from backend:", error);
        if (isMounted) {
          setTrains(initialTrainsData);
          setCities(getAllCities(initialTrainsData));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrains();

    return () => {
      isMounted = false;
    };
  }, []);

  return { trains, cities, loading };
}
