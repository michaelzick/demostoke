import Screen from '@/screens/BookingsPage';
import { PreviewGuard } from '@/app/preview-guard';

export default function Page() {
  return <PreviewGuard><Screen /></PreviewGuard>;
}
