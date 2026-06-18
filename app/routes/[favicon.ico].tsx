import {redirect} from 'react-router';
import {LOGO_URL} from '~/lib/seo';

export async function loader() {
  return redirect(LOGO_URL, 302);
}
