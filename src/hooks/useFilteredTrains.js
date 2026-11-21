import { useState, useEffect } from "react";

export function useFilteredTrains(trains, filters, itemsPerPage) {
  const [currentPage, setCurrentPage] = useState(1);

  const rawQuery = (filters.searchQuery || "").trim().toLowerCase();
  const queryTokens = rawQuery
    .replace(/[—–-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const filtered = trains.filter((train) => {
    const searchableText = [
      train.number,
      train.title,
      train.route?.from?.city,
      train.route?.to?.city,
      train.route?.from?.station,
      train.route?.to?.station,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      queryTokens.length === 0 ||
      queryTokens.every((token) => searchableText.includes(token));

    const matchesWifi = filters.wifiOnly ? train.hasWifi : true;
    const matchesPrice = train.payment.basePrice <= Number(filters.maxPrice);
    const matchesCity =
      filters.selectedCity === "" ||
      train.route.from.city === filters.selectedCity ||
      train.route.to.city === filters.selectedCity;

    let matchDate = true;
    if (filters.selectedDate) {
      const filterTime = new Date(filters.selectedDate).getTime();
      const trainTime = new Date(train.route.from.departureTime).getTime();
      matchDate = trainTime <= filterTime + 86400000;
    }

    return (
      matchesSearch &&
      matchesWifi &&
      matchesPrice &&
      matchesCity &&
      matchDate
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.searchQuery,
    filters.wifiOnly,
    filters.maxPrice,
    filters.selectedCity,
    filters.selectedDate,
  ]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentTrains = filtered.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem,
  );

  return {
    currentTrains,
    totalPages,
    currentPage,
    setCurrentPage,
  };
}
