import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import { PATHS, buildEditSupplierPath } from "../../constants/paths";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const responseData = await ApiService.getAllSuppliers();

        if (responseData.status === 200) {
          setSuppliers(responseData.suppliers || []);
        } else {
          showMessage(responseData.message || "Unable to load suppliers.");
        }
      } catch (error) {
        showMessage(error.response?.data?.message || `Error getting suppliers: ${error}`);
      }
    }

    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

    if (!normalizedSearch) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [supplier.name, supplier.contactInfo, supplier.address]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(normalizedSearch))
    );
  }, [searchTerm, suppliers]);

  function showMessage(nextMessage) {
    setMessage(nextMessage);
    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  async function handleDeleteSupplier(supplierId) {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      await ApiService.deleteSupplier(supplierId);
      setSuppliers((currentValue) =>
        currentValue.filter((supplier) => supplier.id !== supplierId)
      );
      showMessage("Supplier deleted successfully.");
    } catch (error) {
      showMessage(error.response?.data?.message || `Error deleting supplier: ${error}`);
    }
  }

  return (
    <MainLayout>
      {message ? <div className="message">{message}</div> : null}

      <div className="supplier-page manager-entity-page">
        <div className="manager-page-shell">
          <div className="manager-page-banner">
            <div>
              <span className="manager-page-eyebrow">Procurement</span>
              <h1>Suppliers</h1>
              <p className="page-subtitle">
                Manage supplier records used for purchasing and stock inward flows.
              </p>
            </div>
          </div>

          <div className="manager-page-card">
            <div className="page-toolbar manager-inline-toolbar">
              <input
                className="page-search-input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by supplier name, contact info, or address"
              />

              <button type="button" onClick={() => navigate(PATHS.addSupplier)}>
                Add Supplier
              </button>
            </div>
          </div>

          {filteredSuppliers.length ? (
            <div className="manager-data-table-shell">
              <table className="manager-data-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Supplier Name</th>
                    <th>Contact Info</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, index) => (
                    <tr key={supplier.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{supplier.name}</strong>
                      </td>
                      <td>{supplier.contactInfo || "N/A"}</td>
                      <td>{supplier.address || "N/A"}</td>
                      <td>
                        <div className="manager-table-actions-inline">
                          <button
                            type="button"
                            className="table-edit-btn"
                            onClick={() => navigate(buildEditSupplierPath(supplier.id))}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="table-delete-btn"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="page-empty-state">
              <strong>No suppliers found</strong>
              <p>Try another search term or create a new supplier.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SupplierPage;
