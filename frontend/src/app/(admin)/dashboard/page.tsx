import Dashboard from '@/components/dashboard/dashboard';
import { Metadata } from 'next';
// import Dashboard from "@/components/dashboard/dashboard";


export const metadata: Metadata = {
  title: 'Dashboard',
  // description: 'This is the user dashboard',
};

export default async function Home() {
  return <Dashboard />;
}
