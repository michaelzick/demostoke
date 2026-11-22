import Screen from '@/screens/AnalyticsPage';
import { PreviewGuard } from '@/app/preview-guard';

export default function Page() {
  return <PreviewGuard><Screen /></PreviewGuard>;
}
