import { getSocialPublisherData } from './actions';
import { SocialPublisherClient } from '@/components/social-publisher/SocialPublisherClient';

export const dynamic = 'force-dynamic';

export default async function SocialPublisherPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const { accounts, posts } = await getSocialPublisherData();

  return (
    <SocialPublisherClient
      initialAccounts={accounts}
      initialPosts={posts}
      initialTab={tab || 'create'}
    />
  );
}
