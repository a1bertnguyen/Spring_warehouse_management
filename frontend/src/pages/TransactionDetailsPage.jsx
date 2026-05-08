import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";




const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();


  useEffect(() => {
    const getTransaction = async () => {
      try {
        const transactionData = await ApiService.getTransactionById(transactionId);

        if (transactionData.status === 200) {
            setTransaction(transactionData.transaction);
            setStatus(transactionData.transaction.status);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting a transaction: " + error
        );
      }
    };

    getTransaction();
  }, [transactionId]);


//update transaction status
const handleUpdateStatus = async()=>{
    try {
        ApiService.updateTransactionStatus(transactionId, status);
        navigate("/transaction")
    } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Updating a transactions: " + error
        );
        
    }
}


  //Method to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };



  return(
    <Layout>
        
      {message && <p className="message">{message}</p>}
      <div className="transaction-details-page">
        {transaction && (
           <>
           {/* Transaction base information */}
           <div className="section-card">
                <h2>Transaction Information</h2>
                <p>Type: {transaction.transactionType}</p>
                <p>Status: {transaction.status}</p>
                <p>Description: {transaction.description}</p>
                <p>Note: {transaction.note}</p>
                <p>Total Products: {transaction.totalProducts}</p>
                <p>Total Price: {transaction.totalPrice.toFixed(2)}</p>
                <p>Create AT: {new Date(transaction.createdAt).toLocaleString()}</p>

                {transaction.updatedAt && (
                <p>Updated At: {new Date(transaction.updatedAt).toLocaleString()}</p>
                )}
           </div>

           {/* Product information of the transaction */}
           <div className="section-card">
                <h2>Product Information</h2>
                <p>Name: {transaction.product.name}</p>
                <p>SKU: {transaction.product.sku}</p>
                <p>Price: {transaction.product.price.toFixed(2)}</p>
                <p>Stock Quantity: {transaction.product.stockQuantity}</p>
                <p>Description: {transaction.product.description}</p>

                {transaction.product.imageUrl && (
                <img src={transaction.product.imageUrl} alt={transaction.product.name} />
                )}
                
           </div>

           {/* User information who made the transaction */}
           <div className="section-card">
                <h2>User Information</h2>
                <p>Name: {transaction.user.name}</p>
                <p>Email: {transaction.user.email}</p>
                <p>Phone Number: {transaction.user.phoneNumber}</p>
                <p>Role: {transaction.user.role}</p>
                <p>Create AT: {new Date(transaction.createdAt).toLocaleString()}</p>
                
           </div>



           {/* Supplier information who made the transaction */}
           {transaction.suppliers && (
           <div className="section-card">
                <h2>Supplier Information</h2>
                <p>Name: {transaction.supplier.name}</p>
                <p>Contact Address: {transaction.supplier.contactInfo}</p>
                <p>Address: {transaction.supplier.address}</p> 
           </div>
           )}

           {/* UPDATE TRANSACTION STATUS */}
           <div className="section-card transaction-staus-update">
            <label>Status: </label>
            <select 
            value={status}
            onChange={(e)=> setStatus(e.target.value)}
            >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
            </select>
            <button onClick={()=>handleUpdateStatus()}>Update Staus</button>
           </div>
           </>
        )}
      </div>
    </Layout>
  )
};

export default TransactionDetailsPage;
