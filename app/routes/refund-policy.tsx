import {redirect} from 'react-router';
import type {Route} from './+types/refund-policy';

export async function loader(_: Route.LoaderArgs) {
  return redirect('/policies/refund-policy', 301);
}

export default function RefundPolicyRedirect() {
  return null;
}
