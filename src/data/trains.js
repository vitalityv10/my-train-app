export const initialTrainsData = [
  {
    id: 1,
    number: "715К",
    title: "Інтерсіті+ Київ — Львів",
    description: "Швидкісний денний поїзд підвищеного комфорту з кав'ярнею на борту.",
    type: "Day",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    hasWifi: true,
    hasAirConditioning: true,
    route: {
      from: {
        city: "Київ",
        station: "Київ-Пасажирський",
        departureTime: "2026-11-05T06:50:00",
      },
      to: {
        city: "Львів",
        station: "Львів-Головний",
        arrivalTime: "2026-11-05T12:15:00",
      },
      duration: "5 год 25 хв",
    },
    seat: {
      class: "1 клас",
      carriage: 1,
      number: 14,
    },
    payment: {
      basePrice: 220,
    },
  },
  {
    id: 2,
    number: "091К",
    title: "Нічний експрес Київ — Львів",
    description: "Зручний нічний фірмовий поїзд із купейними вагонами та свіжою білизною.",
    type: "Night",
    imageUrl: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=800&q=80",
    hasWifi: true,
    hasAirConditioning: true,
    route: {
      from: {
        city: "Київ",
        station: "Київ-Пасажирський",
        departureTime: "2026-11-05T22:40:00",
      },
      to: {
        city: "Львів",
        station: "Львів-Головний",
        arrivalTime: "2026-11-06T06:20:00",
      },
      duration: "7 год 40 хв",
    },
    seat: {
      class: "Купе",
      carriage: 2,
      number: 8,
    },
    payment: {
      basePrice: 190,
    },
  },
  {
    id: 3,
    number: "105К",
    title: "Чорноморець Київ — Одеса",
    description: "Фірмовий нічний поїзд сполученням столиця — узбережжя Чорного моря.",
    type: "Night",
    imageUrl: "https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80",
    hasWifi: false,
    hasAirConditioning: true,
    route: {
      from: {
        city: "Київ",
        station: "Київ-Пасажирський",
        departureTime: "2026-11-06T21:15:00",
      },
      to: {
        city: "Одеса",
        station: "Одеса-Головна",
        arrivalTime: "2026-11-07T06:10:00",
      },
      duration: "8 год 55 хв",
    },
    seat: {
      class: "Купе",
      carriage: 3,
      number: 21,
    },
    payment: {
      basePrice: 180,
    },
  },
  {
    id: 4,
    number: "722К",
    title: "Інтерсіті+ Київ — Харків",
    description: "Сучасний швидкісний електропоїзд із розетками біля кожного крісла.",
    type: "Day",
    imageUrl: "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=800&q=80",
    hasWifi: true,
    hasAirConditioning: true,
    route: {
      from: {
        city: "Київ",
        station: "Київ-Пасажирський",
        departureTime: "2026-11-07T13:00:00",
      },
      to: {
        city: "Харків",
        station: "Харків-Пасажирський",
        arrivalTime: "2026-11-07T18:10:00",
      },
      duration: "5 год 10 хв",
    },
    seat: {
      class: "2 клас",
      carriage: 2,
      number: 30,
    },
    payment: {
      basePrice: 160,
    },
  },
  {
    id: 5,
    number: "732К",
    title: "Інтерсіті+ Київ — Дніпро",
    description: "Комфортабельний денний рейс до ділового центру Придніпров'я.",
    type: "Day",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    hasWifi: true,
    hasAirConditioning: true,
    route: {
      from: {
        city: "Київ",
        station: "Київ-Пасажирський",
        departureTime: "2026-11-08T07:15:00",
      },
      to: {
        city: "Дніпро",
        station: "Дніпро-Головний",
        arrivalTime: "2026-11-08T13:05:00",
      },
      duration: "5 год 50 хв",
    },
    seat: {
      class: "1 клас",
      carriage: 1,
      number: 5,
    },
    payment: {
      basePrice: 210,
    },
  },
  {
    id: 6,
    number: "043К",
    title: "Стефанія Експрес Львів — Івано-Франківськ",
    description: "Мальовничий карпатський маршрут зі зручним розкладом.",
    type: "Day",
    imageUrl: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=800&q=80",
    hasWifi: false,
    hasAirConditioning: true,
    route: {
      from: {
        city: "Львів",
        station: "Львів-Головний",
        departureTime: "2026-11-09T09:30:00",
      },
      to: {
        city: "Івано-Франківськ",
        station: "Івано-Франківськ",
        arrivalTime: "2026-11-09T11:45:00",
      },
      duration: "2 год 15 хв",
    },
    seat: {
      class: "Плацкарт",
      carriage: 3,
      number: 12,
    },
    payment: {
      basePrice: 110,
    },
  },
];

export const getAllCities = (trains = initialTrainsData) => {
  const cities = new Set();
  trains.forEach((train) => {
    if (train?.route?.from?.city) cities.add(train.route.from.city);
    if (train?.route?.to?.city) cities.add(train.route.to.city);
  });
  return Array.from(cities);
};
