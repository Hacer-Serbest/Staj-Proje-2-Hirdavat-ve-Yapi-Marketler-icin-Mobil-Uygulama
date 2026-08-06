import { useLocalSearchParams } from 'expo-router';

import CustomerForm from '../../../components/customers/CustomerForm';

export default function EditCustomer() {
  const { id } = useLocalSearchParams();
  return <CustomerForm customerId={id} />;
}
