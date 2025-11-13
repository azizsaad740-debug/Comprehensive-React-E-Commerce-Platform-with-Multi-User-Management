"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { useContentStore } from '@/stores/contentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ContentPageProps {
  slug: string;
}

const ContentPage: React.FC<ContentPageProps> = ({ slug }) => {
  const { getStaticPage } = useContentStore();
  const page = getStaticPage(slug);

  if (!page || !page.isActive) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Page Not Found or Inactive</h1>
          <p className="text-gray-600">The requested page content could not be loaded.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{page.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Render content. Using dangerouslySetInnerHTML for mock HTML/Markdown content */}
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContentPage;