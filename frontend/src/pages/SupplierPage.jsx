import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    //fetech all suppliers
    const getSuppliers = async () => {
      try {
        const responseData = await ApiService.getAllSuppliers();
        if (responseData.status === 200) {
          setSuppliers(responseData.suppliers);
        } else {
          showMessage(responseData.message);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Suppliers: " + error
        );
        console.log(error);
      }
    };
    getSuppliers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };


//Delete Supplier
const handleDeleteSupplier = async (supplierId) => {
  try {
    if (window.confirm("Are you sure you want to delete this supplier? ")) {
      await ApiService.deleteSupplier(supplierId);
      window.location.reload();
    }
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Error Deleting a Suppliers: " + error
    );
  }
};



return(
    <Layout>
        {message && <div className="message">{message}</div>}
        <div className="supplier-page">
            <div className="supplier-header">
                <h1>Suppliers</h1>
                <div className="add-sup">
                    <button onClick={()=> navigate("/add-supplier")} >Add Supplier</button>
                </div>
            </div>
        </div>

        {suppliers && 
        <ul className="supplier-list">
            
            {suppliers.map((supplier) => (
                <li className="supplier-item" key={supplier.id}>
                    <span>{supplier.name}</span>

                    <div className="supplier-actions">
                        <button onClick={()=> navigate(`/edit-supplier/${supplier.id}`)} >Edit</button>
                        <button onClick={()=> handleDeleteSupplier(supplier.id)} >Delete</button>
                    </div>

                </li>
            ))}

        </ul>
        
        }
    </Layout>
)

}
export default SupplierPage;
