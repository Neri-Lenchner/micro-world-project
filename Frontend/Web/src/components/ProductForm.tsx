import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { productsApi } from "../api/productsApi";
import { CONDITIONS, Condition, Product, ProductInput } from "../types/product";
import { capitalize } from "../utils/format";
import "./ProductForm.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // Same limit as the Catalog service.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
  initial?: Product;
  submitLabel: string;
  onSubmit: (input: ProductInput, image: File | null) => Promise<void>;
  onCancel: () => void;
}

// Shared by the Sell and Edit pages.
export default function ProductForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [condition, setCondition] = useState<Condition>(initial?.condition ?? "used");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => setError("Failed to load categories"));
  }, []);

  // Show the newly picked file before it's uploaded; free the temporary URL when it changes.
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = ""; // Allows picking the same file again after removing it.
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError("Only JPG, PNG, WEBP or GIF images are allowed");
    if (file.size > MAX_IMAGE_SIZE) return setError("Image must be at most 5 MB");
    setError(null);
    setImage(file);
  }

  function removeImage() {
    setImage(null);
    setCurrentImageUrl(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericPrice = Number(price);
    if (!title.trim() || !description.trim()) return setError("Title and description are required");
    if (price === "" || !Number.isFinite(numericPrice) || numericPrice < 0) return setError("Enter a valid price");
    if (!category) return setError("Choose a category");

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(
        { title: title.trim(), description: description.trim(), price: numericPrice, category, condition, imageUrl: currentImageUrl },
        image,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving failed");
      setSubmitting(false);
    }
  }

  const shownImage = preview ?? currentImageUrl;

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={5} required />
      </label>
      <label>
        Price (₪)
        <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </label>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>Choose a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{capitalize(c)}</option>
          ))}
        </select>
      </label>
      <fieldset className="radio-group">
        <legend>Condition</legend>
        {CONDITIONS.map((c) => (
          <label key={c}>
            <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setCondition(c)} />
            {capitalize(c)}
          </label>
        ))}
      </fieldset>

      <div className="image-field">
        <span>Photo (optional, up to 5 MB)</span>
        {shownImage && <img className="image-preview" src={shownImage} alt="Product preview" />}
        <div className="actions">
          <label className="button secondary file-button">
            {shownImage ? "Change photo" : "Choose photo"}
            <input type="file" accept={IMAGE_TYPES.join(",")} onChange={handleImageChange} hidden />
          </label>
          {shownImage && (
            <button type="button" className="secondary" onClick={removeImage}>Remove photo</button>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" disabled={submitting}>{submitting ? "Saving…" : submitLabel}</button>
        <button type="button" className="secondary" onClick={onCancel} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}
