import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do I purchase a product?',
    answer:
      'Simply choose a product and variant, click "Purchase", and send the payment via CashApp to $allcheats. After sending, DM Red.Gov or Ryoko with your receipt for instant delivery.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We currently accept CashApp only. Send payments to CashApp tag: $allcheats.',
  },
  {
    question: 'How long until I receive my product?',
    answer:
      'After confirming your payment, you will receive your product key or account credentials within minutes. DM Red.Gov or Ryoko with your receipt for the fastest delivery.',
  },
  {
    question: 'Is the software undetected?',
    answer:
      'Yes. Our software is regularly updated to remain undetected by anti-cheat systems. We monitor detection status 24/7 and push updates as needed.',
  },
  {
    question: 'What happens when my key expires?',
    answer:
      'When your key expires, the software will stop working. You can purchase a new key at any time to continue using the product. Consider the Unlimited Key for lifetime access.',
  },
  {
    question: 'Who runs Allcheats.co?',
    answer:
      'Allcheats.co is owned and operated by Red.Gov and Ryoko. You can contact either of them for support, questions, or purchase assistance.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Due to the digital nature of our products, all sales are final. We recommend trying the 1 Day Key first to see if the product meets your needs.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-dark-500 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition"
      >
        <span className="pr-4 text-sm font-semibold text-white sm:text-base">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-red-light transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="animate-slide-down pb-5 text-sm leading-relaxed text-gray-400">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block rounded-full border border-red-primary/30 bg-red-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-red-light">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Frequently Asked <span className="text-red-light">Questions</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Got questions? We've got answers. If you need further help, contact Red.Gov or Ryoko.
          </p>
        </div>

        <div className="rounded-2xl border border-dark-500 bg-dark-800 px-6">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
