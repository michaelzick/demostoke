import { AdminGate } from '@/app/admin-gate';
import { isReadOnlyPreview } from '@/lib/deployment';
import { UserProfileNotFound } from '@/components/profile/UserProfileNotFound';
import ProfilePage from '@/screens/RealUserProfilePage';

export default function MissingPublicProfile() {
  if (isReadOnlyPreview) return <UserProfileNotFound />;
  return <AdminGate fallback={<UserProfileNotFound />}><ProfilePage /></AdminGate>;
}
