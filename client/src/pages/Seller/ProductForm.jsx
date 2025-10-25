import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProductForm(){
  const [form, setForm] = useState({name:'', price:'', description:'', category:'', stock:1});
  const [file, setFile] = useState(null);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=> fd.append(k, v));
    if (file) fd.append('image', file);
    await api.post('/products', fd, { headers: {'Content-Type': 'multipart/form-data'}});
    nav('/seller/products');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
      <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
      <input placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
      <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
      <input type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} />
      <input type="file" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit">Create</button>
    </form>
  )
}
