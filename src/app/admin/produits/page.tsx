import { redirect } from 'next/navigation';

export default function AdminProduitsRedirect() {
  redirect('/gestionnaire/produits');
}
