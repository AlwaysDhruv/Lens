import React, { useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Search(){
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await api.get(`/products?search=${encodeURIComponent(q)}`);
    setResults(res.data);
  };

  return (
    <div>
      <h2>Search</h2>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="name or category" />
      <button onClick={handleSearch}>Search</button>
      <div className="grid">{results.map(p=> <ProductCard key={p._id} p={p}/>)}</div>
    </div>
  )
}
