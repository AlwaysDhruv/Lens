import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function Products(){
  const [products, setProducts] = useState([]);
  useEffect(()=> {
    api.get('/products/my').then(r=> setProducts(r.data));
  }, []);
  const del = async (id) => {
    if(!confirm('Delete?')) return;
    await api.delete(`/products/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
  }
  return (
    <div>
      <h3>Your Products</h3>
      <Link to="/seller/new">Add Product</Link>
      <ul>
        {products.map(p=> <li key={p._id}>{p.name} - ₹{p.price} <button onClick={()=> del(p._id)}>Delete</button></li>)}
      </ul>
    </div>
  );
}
