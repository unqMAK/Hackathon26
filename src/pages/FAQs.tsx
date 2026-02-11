import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  section: string;
  order: number;
}

const FAQs = () => {
  const { data, isLoading, isError } = useQuery<{ faqs: FAQ[]; grouped: { [key: string]: FAQ[] } }>({
    queryKey: ['publicFaqs'],
    queryFn: async () => {
      const response = await api.get('/faqs');
      return response.data;
    }
  });

  const grouped = data?.grouped || {};
  const sections = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about the MIT Vishwaprayag University Hackathon
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg mb-4">Failed to load FAQs. Please try again later.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No FAQs available at the moment.</p>
          </div>
        ) : (
          sections.map((section, catIndex) => (
            <div key={catIndex} className="mb-12 animate-slide-up" style={{ animationDelay: `${catIndex * 0.1}s` }}>
              <h2 className="text-2xl font-bold mb-6 gradient-text-orange">{section} Questions</h2>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {grouped[section].map((faq, index) => (
                      <AccordionItem key={faq._id} value={`item-${catIndex}-${index}`}>
                        <AccordionTrigger className="text-left hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))
        )}

        <div className="wave-bg rounded-2xl p-8 md:p-12 text-center mt-12 min-h-[250px] flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 text-base">
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-glow" asChild>
              <Link to="/contact">
                Contact Support
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-accent hover:text-accent-foreground" asChild>
              <Link to="/guidelines">
                View Guidelines
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQs;