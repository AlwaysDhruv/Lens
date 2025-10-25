// client/src/pages/Seller/Store.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function Store() {
  const [store, setStore] = useState({
    name: "",
    description: "",
    type: "",
    address: "",
  });

  useEffect(() => {
    // fetch seller's current store info if it exists
    api
      .get("/stores")
      .then((res) => {
        const userStore = res.data.find(
          (s) => s.owner?._id === JSON.parse(localStorage.getItem("user"))?._id
        );
        if (userStore) setStore(userStore);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setStore({ ...store, [e.target.name]: e.target.value });
  };

  const saveStore = async (e) => {
    e.preventDefault();
    await api.post("/stores", store);
    alert("Store info saved!");
  };

  return (
    <div>
      <h3>Store Information</h3>
      <form onSubmit={saveStore}>
        <input
          name="name"
          placeholder="Store Name"
          value={store.name}
          onChange={handleChange}
        />
        <input
          name="type"
          placeholder="Type (e.g., Optical, Sunglasses)"
          value={store.type}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={store.description}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={store.address}
          onChange={handleChange}
        />
        <button type="submit">Save</button>
      </form>

      {store._id && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Total Products:</strong> {store.totalProducts}</p>
          <p><strong>Categories:</strong> {store.categories?.join(", ") || "None"}</p>
        </div>
      )}
    </div>
  );
}
