import Screen from '@/screens/AdminPage';
import { PreviewGuard } from '@/app/preview-guard';
import { AdminGate } from '@/app/admin-gate';

export default function Page() {
  return <PreviewGuard><AdminGate><Screen /></AdminGate></PreviewGuard>;
}
