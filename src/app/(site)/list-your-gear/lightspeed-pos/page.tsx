import Screen from '@/screens/LightspeedPOSPage';
import { PreviewGuard } from '@/app/preview-guard';

export default function Page() {
  return <PreviewGuard><Screen /></PreviewGuard>;
}
