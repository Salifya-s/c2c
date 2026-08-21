import {AuthExperience} from '@/src/components/pages/AuthExperience';

type AuthPageProps = {
  searchParams?: Promise<{ role?: string }>;
};

const AuthPage = async ({ searchParams }: AuthPageProps) => {
  const resolvedSearchParams = await searchParams;
  const initialRole = resolvedSearchParams?.role === 'vendor' ? 'vendor' : 'customer';

  return <AuthExperience initialRole={initialRole} />;
};

export default AuthPage;
