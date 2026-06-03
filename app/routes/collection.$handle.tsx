import {redirect} from 'react-router';
import type {Route} from './+types/collection.$handle';

export async function loader({params}: Route.LoaderArgs) {
  const handle = params.handle;

  if (!handle) {
    return redirect('/collections', {status: 301});
  }

  return redirect(`/collections/${handle}`, {status: 301});
}

export default function SingularCollectionRedirect() {
  return null;
}
