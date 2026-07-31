import { LuArrowLeft, LuLayoutDashboard } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { Button, LinkButton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useDocumentTitle } from '@/hooks';

import { SystemMessage } from './system-message';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();

  return (
    <SystemMessage
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist, or you may not have access to it. Check the address and try again."
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
