import { useNavigate } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import ProductForm from "../components/ProductForm";

export default function SellPage() {
  const navigate = useNavigate();

  return (
    <div className="form-page wide">
      <h1>Sell an item</h1>
      <ProductForm
        submitLabel="Publish"
        onSubmit={async (input, image) => {
          const product = await productsApi.create(input, image);
          navigate(`/products/${product.id}`);
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
