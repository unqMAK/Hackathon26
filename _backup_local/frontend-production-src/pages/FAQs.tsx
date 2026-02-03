import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQs = () => {
  const faqs = [
    {
      question: 'Who can participate in the hackathon?',
      answer: 'The hackathon is open to students from all colleges and universities. Teams can have 4-6 members from the same institute.'
    },
    {
      question: 'Is there a registration fee?',
      answer: 'No, participation in the MIT Vishwaprayag University Hackathon is completely free. There are no registration or participation fees.'
    },
    {
      question: 'What is the hackathon duration?',
      answer: 'The hackathon is a 48-hour continuous event. Teams will have 2 full days to develop their solutions from scratch.'
    },
    {
      question: 'Do I need to have a team before registering?',
      answer: 'Yes, you need to form a team of 4-5 members before registration. All team members must be from the same institute.'
    },
    {
      question: 'Can I participate remotely?',
      answer: 'The hackathon will be conducted in-person at MIT-VPU campus. Remote participation may be considered on a case-by-case basis.'
    },
    {
      question: 'What should we bring to the hackathon?',
      answer: 'Bring your laptops, chargers, required software installations, and any hardware components if needed. Food and basic amenities will be provided.'
    },
    {
      question: 'Are there any specific technologies we must use?',
      answer: 'No, you are free to use any technology stack, programming language, or framework that best suits your problem statement.'
    },
    {
      question: 'How will projects be evaluated?',
      answer: 'Projects will be judged based on Innovation (25%), Technical Implementation (25%), Impact & Feasibility (20%), Presentation (15%), and Completion (15%).'
    },
    {
      question: 'What are the prizes?',
      answer: 'The total prize pool is ₹5 Lakh+, with prizes for top 3 teams, best innovation, and various category awards.'
    },
    {
      question: 'Can we use pre-written code?',
      answer: 'You can use open-source libraries and frameworks, but the core application logic must be developed during the hackathon period.'
    },
    {
      question: 'Will mentors be available during the hackathon?',
      answer: 'Yes, experienced mentors from industry and academia will be available throughout to guide teams.'
    },
    {
      question: 'What is the role of a SPOC?',
      answer: 'SPOC (Single Point of Contact) is a faculty member from each institute who coordinates and manages all teams from their institution.'
    },
    {
      question: 'How do we submit our project?',
      answer: 'Submissions include a working demo, documentation, GitHub repository, and a 5-minute video demonstration, all submitted through the portal.'
    },
    {
      question: 'What happens after Round 1?',
      answer: 'Shortlisted teams from Round 1 advance to Round 2 for detailed evaluation, followed by a grand finale with presentations.'
    },
    {
      question: 'Will accommodation be provided?',
      answer: 'Accommodation arrangements can be made for outstation teams. Please contact the organizing committee for details.'
    },
  ];

  const categories = [
    { title: 'General', range: [0, 4] },
    { title: 'Technical', range: [5, 9] },
    { title: 'Evaluation', range: [10, 14] },
  ];

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

        {categories.map((category, catIndex) => (
          <div key={catIndex} className="mb-12 animate-slide-up" style={{ animationDelay: `${catIndex * 0.1}s` }}>
            <h2 className="text-2xl font-bold mb-6 gradient-text-orange">{category.title} Questions</h2>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.slice(category.range[0], category.range[1] + 1).map((faq, index) => (
                    <AccordionItem key={index} value={`item-${category.range[0] + index}`}>
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
        ))}

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