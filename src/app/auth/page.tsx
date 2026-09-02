import {redirect} from 'next/navigation';

/**
 * Auth now lives in the `#access` panel on the landing page, so this route
 * forwards rather than rendering a second implementation. `vendor` is accepted
 * alongside `merchant` because the retired auth screen used that wording.
 */
const AuthPage = async ({searchParams}: PageProps<'/auth'>) => {
  const query = await searchParams;
  const isMerchant = query.role === 'merchant' || query.role === 'vendor';

  redirect(isMerchant ? '/?role=merchant#access' : '/#access');
};

export default AuthPage;
