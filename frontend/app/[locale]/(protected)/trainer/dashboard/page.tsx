import { ClientList } from '@/features/trainer/components/ClientList';
import { InviteLinkGenerator } from '@/features/trainer/components/InviteLinkGenerator';

const TrainerDashboard = () => {
  return (
    <div>
      <InviteLinkGenerator />
      <ClientList />
      {/* Other dashboard components */}
    </div>
  );
};

export default TrainerDashboard;
