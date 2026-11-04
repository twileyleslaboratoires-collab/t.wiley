import { redirect } from 'next/navigation';

export default function AdminCategoriesRedirect() {
  redirect('/gestionnaire/categories');
}
