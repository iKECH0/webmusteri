"use client";

import { use } from 'react';
import AgentLoginPage from '../page';

export default function AgentSlugPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  return <AgentLoginPage initialSlug={slug} />;
}
