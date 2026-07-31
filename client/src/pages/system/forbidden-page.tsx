import { LuArrowLeft, LuLayoutDashboard } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { Button, LinkButton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';

import { SystemMessage } from './system-message';

export default function ForbiddenPage() {
  useDocumentTitle('Access denied');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <SystemMessage
      code="403"
      title="Access denied"
      description={
        <>
          You do not have permission to view this page. If you believe this is a mistake, contact
          your administrator and quote the account
          {/* Naming the account shortcuts the "which login were you using?" round trip. */}
          {user?.email ? <span className="font-medium text-fg"> {user.email}</span> : null}.
        </>
      }
      actions={
        <>
          <Button leadingIcon={<LuArrowLeft />} onClick={() => void navigate(-1)}>
            Go back
          </Button>
          <LinkButton to={ROUTES.dashboard} variant="primary" leadingIcon={<LuLayoutDashboard />}>
            Go to dashboard
          </LinkButton>
        </>
      }
    />
  );
}
