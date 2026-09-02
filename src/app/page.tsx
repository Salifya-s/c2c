import {LandingPage} from '@/src/components/landing/LandingPage';

const Page = async ({searchParams}: PageProps<'/'>) => {
  const query = await searchParams;
  const initialRole = query.role === 'merchant' ? 'merchant' : 'customer';

  return <LandingPage initialRole={initialRole} />;
};

export default Page;
