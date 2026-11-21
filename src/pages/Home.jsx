import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Offcanvas,
  Spinner,
} from "react-bootstrap";
import { FaFilter, FaTrain } from "react-icons/fa";
import TrainFilters from "../components/train/TrainFilter";
import TrainList from "../components/train/TrainList";
import SmartSearchBar from "../components/ai/SmartSearchBar";
import AppPagination from "../components/utils/AppPagination";
import { initialTrainsData, getAllCities } from "../data/trains";
import { useFilteredTrains } from "../hooks/useFilteredTrains";
import { useTrainsData } from "../hooks/useTrainsData";
import { useCart } from "../components/context/CartContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function Home() {
  const { trains, cities, loading } = useTrainsData();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useLocalStorage("trainSearchQuery", "");
  const [wifiOnly, setWifiOnly] = useLocalStorage("trainWifiFilter", false);
  const [maxPrice, setMaxPrice] = useLocalStorage("trainMaxPrice", 250);
  const [selectedCity, setSelectedCity] = useLocalStorage("trainCity", "");
  const [selectedDate, setSelectedDate] = useLocalStorage("trainDate", "");

  const [aiResultTrains, setAiResultTrains] = useState(null);
  const [activeAiFilter, setActiveAiFilter] = useState(null);

  const { addToCart } = useCart();
  const allCities =
    cities && cities.length > 0
      ? cities
      : getAllCities(trains.length > 0 ? trains : initialTrainsData);

  const handleApplySmartSearch = ({ appliedFilter, trains: smartTrains }) => {
    if (appliedFilter) {
      setActiveAiFilter(appliedFilter);
      if (appliedFilter.search !== undefined) {
        setSearchQuery(appliedFilter.search || "");
      }
      if (appliedFilter.city !== undefined) {
        setSelectedCity(appliedFilter.city || "");
      }
      if (appliedFilter.date !== undefined) {
        setSelectedDate(appliedFilter.date || "");
      }
      if (
        appliedFilter.maxPrice !== undefined &&
        appliedFilter.maxPrice !== null
      ) {
        setMaxPrice(Number(appliedFilter.maxPrice));
      }
      if (appliedFilter.wifiOnly !== undefined) {
        setWifiOnly(Boolean(appliedFilter.wifiOnly));
      }
    }
    if (Array.isArray(smartTrains)) {
      setAiResultTrains(smartTrains);
    } else {
      setAiResultTrains(null);
    }
  };

  const handleClearSmartSearch = () => {
    setActiveAiFilter(null);
    setAiResultTrains(null);
  };

  const sourceTrains = aiResultTrains !== null ? aiResultTrains : trains;

  const { currentTrains, totalPages, currentPage, setCurrentPage } =
    useFilteredTrains(
      sourceTrains,
      { searchQuery, wifiOnly, maxPrice, selectedCity, selectedDate },
      3,
    );

  const renderFilters = () => (
    <TrainFilters
      searchQuery={searchQuery}
      onSearchChange={(val) => {
        setAiResultTrains(null);
        setSearchQuery(val);
      }}
      wifiOnly={wifiOnly}
      onWifiChange={(val) => {
        setAiResultTrains(null);
        setWifiOnly(val);
      }}
      maxPrice={maxPrice}
      onPriceChange={(val) => {
        setAiResultTrains(null);
        setMaxPrice(val);
      }}
      selectedCity={selectedCity}
      onCityChange={(val) => {
        setAiResultTrains(null);
        setSelectedCity(val);
      }}
      selectedDate={selectedDate}
      onDateChange={(val) => {
        setAiResultTrains(null);
        setSelectedDate(val);
      }}
      cities={allCities}
    />
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Container className="pt-4 pt-md-5">
        <SmartSearchBar
          onApplySmartSearch={handleApplySmartSearch}
          onClearSmartSearch={handleClearSmartSearch}
          activeAiFilter={activeAiFilter}
        />

        <div className="d-lg-none mb-4">
          <Button
            variant="primary"
            className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={() => setShowMobileFilters(true)}
          >
            <FaFilter /> Налаштувати пошук
          </Button>
        </div>

        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block">
            <div className="sticky-top" style={{ top: "90px" }}>
              {renderFilters()}
            </div>
          </Col>

          <Col xs={12} lg={9}>
            {loading ? (
              <LoadingState />
            ) : currentTrains.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <TrainList trains={currentTrains} addToCart={addToCart} />
                <div className="mt-5 d-flex justify-content-center">
                  <AppPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </Col>
        </Row>

        <Offcanvas
          show={showMobileFilters}
          onHide={() => setShowMobileFilters(false)}
          placement="start"
        >
          <Offcanvas.Header closeButton className="border-bottom">
            <Offcanvas.Title className="text-primary fw-bold">
              Параметри пошуку
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="bg-light">
            {renderFilters()}
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </div>
  );
}

const LoadingState = () => (
  <div className="text-center mt-5 p-5 bg-white rounded-4 shadow-sm">
    <Spinner animation="border" variant="primary" className="mb-3" />
    <h5 className="text-primary">Завантажуємо розклад...</h5>
  </div>
);

const EmptyState = () => (
  <div className="text-center p-5 bg-white rounded-4 shadow-sm text-muted">
    <FaTrain size={50} className="mb-3 opacity-25" />
    <h4>Нічого не знайдено</h4>
    <p>Спробуйте змінити параметри фільтрації.</p>
  </div>
);
