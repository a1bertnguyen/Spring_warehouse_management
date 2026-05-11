import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildTransactionDailyData } from "./adminDashboardUtils";

const StaffDashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");
  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionResponse = await ApiService.getAllTransactions();

        if (transactionResponse.status === 200) {
          setTransactionData(
            buildTransactionDailyData(
              transactionResponse.transactions || [],
              selectedMonth,
              selectedYear
            )
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || `Error loading dashboard: ${error}`
        );
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, selectedData]);

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}

      <div className="dashboard-page">
        <div className="button-group">
          <button onClick={() => setSelectedData("count")}>
            Total Transactions
          </button>
          <button onClick={() => setSelectedData("quantity")}>
            Product Quantity
          </button>
          <button onClick={() => setSelectedData("amount")}>Amount</button>
        </div>

        <div className="dashboard-content">
          <div className="filter-section">
            <label htmlFor="month-select">Select Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(parseInt(event.target.value, 10))}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(0, index).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <label htmlFor="year-select">Select Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(event) => setSelectedYear(parseInt(event.target.value, 10))}
            >
              {Array.from({ length: 5 }, (_, index) => {
                const year = new Date().getFullYear() - index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="chart-section">
            <div className="chart-container">
              <h3>Daily Transactions</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    label={{ value: "Day", position: "insideBottomRight", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedData}
                    stroke="#008080"
                    fillOpacity={0.3}
                    fill="#008080"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffDashboardPage;
