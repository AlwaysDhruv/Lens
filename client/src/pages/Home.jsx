import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home(){
  const [products, setProducts] = useState([]);
  useEffect(()=> {
    (async ()=> {
      const res = await api.get('/products');
      setProducts(res.data);
    })();
  }, []);
  return (
    <div>
      <h2>Products</h2>
      <div className="grid">
        {products.map(p => <ProductCard key={p._id} p={p} />)}
      </div>
    </div>
  );
}
