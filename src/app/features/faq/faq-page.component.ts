import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

interface FaqItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

@Component({
  selector: 'app-faq-page',
  imports: [RouterLink],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqPageComponent {
  private readonly seo = inject(SeoService);

  protected readonly faqs: FaqItem[] = [
    {
      question: 'Can I provide my own balloons?',
      answer:
        'Almost always, no. I work with premium balloons that hold color, resist popping, and guarantee the finish you see in my portfolio. If you have a special-printed piece you are attached to, I am happy to evaluate it and weave it in, but I cannot guarantee its performance.',
      defaultOpen: true
    },
    {
      question: 'How much time do you need for set up?',
      answer:
        'Plan for at least a two-hour installation window so I can build, refine, and safety check every element. Intricate ceiling work or large-scale builds may require additional time, and I will confirm that during our design call.'
    },
    {
      question: 'Is there a set up, break down, or delivery charge?',
      answer:
        'Yes. Small installs include a $75 setup/breakdown/delivery fee. Larger builds that require my cargo van or rental box truck include a $125 logistics fee. These charges ensure I arrive with the right crew, rigging, and cleanup plan.'
    },
    {
      question: 'How far do you travel?',
      answer:
        'Standard pricing covers events within 30 miles of Belleville, Michigan. I happily travel farther—there is simply a mileage-based fee that I will quote once I have the venue address.'
    },
    {
      question: 'How much lead time do you need to book?',
      answer:
        'Please allow at least two weeks. Last-minute bookings can sometimes be accommodated, but they incur a rush fee and depend on existing installs already on the calendar.'
    }
  ];

  constructor() {
    this.seo.update({
      title: "Balloon Install FAQ | Bunny's Balloons Detroit Metro",
      description:
        'Get answers about pricing, travel, sourcing, logistics, and lead times for Bunny’s Balloons luxury balloon installs across Belleville, Michigan and the Detroit metro region.',
      path: '/faq',
      type: 'FAQPage',
      keywords: [
        'balloon install faq',
        'Bunny’s Balloons policies',
        'Detroit balloon delivery fee',
        'Belleville balloon lead time',
        'Michigan balloon travel radius'
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: this.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    });
  }
}
