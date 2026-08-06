import { useLocalSearchParams } from 'expo-router';

import ProductForm from '../../../components/products/ProductForm';

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  return <ProductForm productId={id} />;
}
