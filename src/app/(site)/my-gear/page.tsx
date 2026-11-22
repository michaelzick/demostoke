import Screen from '@/screens/MyEquipmentPage';
import { PreviewGuard } from '@/app/preview-guard';

export default function Page() {
  return <PreviewGuard><Screen /></PreviewGuard>;
}
