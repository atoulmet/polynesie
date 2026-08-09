import { redirect } from 'next/navigation';

// Les pages du site sont les fichiers HTML statiques servis depuis public/
export default function Home() {
  redirect('/index.html');
}
