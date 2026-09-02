import {redirect} from 'next/navigation';

/**
 * The standalone marketing hub was retired in favour of the landing page at `/`,
 * which carries the same pitch plus the live auth panel. Kept as a redirect so
 * existing links and bookmarks do not 404.
 */
const HubPage = () => {
  redirect('/');
};

export default HubPage;
