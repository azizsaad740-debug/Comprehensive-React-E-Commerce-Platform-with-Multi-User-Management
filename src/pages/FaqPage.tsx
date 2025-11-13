"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { useContentStore } from '@/stores/contentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FaqPage: React.FC = () => {
  const { faqItems } = useContentStore();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center space-x-2">
              <HelpCircle className="h-6 w-6" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faqItems.length === 0 ? (
              <p className="text-gray-600">No FAQs available yet.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map(item => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="font-semibold text-left">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FaqPage;