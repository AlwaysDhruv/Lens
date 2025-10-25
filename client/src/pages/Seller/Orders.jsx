// client/src/pages/Seller/Orders.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // fetch all orders belonging to the logged-in seller
    api
      .get("/orders/seller")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!orders.length)
    return <p style={{ textAlign: "center" }}>No orders yet.</p>;

  return (
    <div>
      <h3>Orders</h3>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Products</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.buyer?.name || "Unknown"}</td>
              <td>
                {o.items
                  .filter((i) => i.seller === o.seller || i.seller?._id)
                  .map((i) => (
                    <div key={i.product}>{i.product?.name || "Deleted product"}</div>
                  ))}
              </td>
              <td>₹{o.total}</td>
              <td>{o.status}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
