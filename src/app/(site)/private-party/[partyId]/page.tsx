import Screen from '@/screens/PrivatePartyPage';
import { PreviewGuard } from '@/app/preview-guard';

export default function Page() {
  return <PreviewGuard><Screen /></PreviewGuard>;
}
