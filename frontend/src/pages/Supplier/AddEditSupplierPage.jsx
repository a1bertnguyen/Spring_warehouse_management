import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "../../constants/paths";

const AddEditSupplierPage = () => {
  const { supplierId } = useParams("");
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (supplierId) {
      setIsEditing(true);

      const fetchSupplier = async () => {
        try {
          const supplierData = await ApiService.getSupplierById(supplierId);
          if (supplierData.status === 200) {
            setName(supplierData.supplier.name);
            setContactInfo(supplierData.supplier.contactInfo);
            setAddress(supplierData.supplier.address);
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Error Getting a SUpplier by Id: " + error
          );
        }
      };
      fetchSupplier();
    }
  }, [supplierId]);

  //handle form submission for both add and edit supplier
  const handleSubmit = async (e) => {
    e.preventDefault();
    const supplierData = { name, contactInfo, address };

    try {
      if (isEditing) {
        await ApiService.updateSupplier(supplierId, supplierData);
        showMessage("Supplier Edited succesfully");
        navigate(PATHS.supplier);
      } else {
        await ApiService.addSupplier(supplierData);
        showMessage("Supplier Added succesfully");
        navigate(PATHS.supplier);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Error Getting a SUpplier by Id: " + error
      );
    }
  };

  //metjhod to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}
      <div className="manager-page-shell">
        <div className="manager-page-banner">
          <div>
            <span className="manager-page-eyebrow">Procurement</span>
            <h1>{isEditing ? "Update Supplier" : "Add Supplier"}</h1>
            <p className="page-subtitle">
              Keep supplier records consistent with the same visual system used across the
              warehouse manager workspace.
            </p>
          </div>
        </div>

        <div className="manager-page-card manager-form-card">
          <form onSubmit={handleSubmit} className="manager-form-grid">
            <div className="form-group">
              <label htmlFor="supplier-name">Supplier Name</label>
              <input
                id="supplier-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                type="text"
                placeholder="Enter supplier name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplier-contact-info">Contact Info</label>
              <input
                id="supplier-contact-info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required
                type="text"
                placeholder="Email, phone number, or representative"
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="supplier-address">Address</label>
              <input
                id="supplier-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                type="text"
                placeholder="Enter supplier address"
              />
            </div>

            <div className="manager-form-actions">
              <button
                type="button"
                className="secondary-page-button"
                onClick={() => navigate(PATHS.supplier)}
              >
                Back
              </button>
              <button type="submit" className="manager-primary-button">
                {isEditing ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
export default AddEditSupplierPage;
