import {
  collections,
  faqs,
  products,
} from './products'
import {INSTAGRAM_LINK, WHATSAPP_NUMBER} from '../config/contact'

export const fallbackContent = {
  homepage: {
    heroEyebrow: 'Thoughtful furniture for the life within',
    heroTitle: 'Every Space Tells a Story.',
    heroDescription: 'We create timeless, comfortable pieces for the rooms where life unfolds—and the homes people love coming back to.',
    heroImage: {url: '/hero-living-room.jpg', altText: 'Warm modern living room with Luvin Home furniture'},
    heroPrimaryCtaLabel: 'Explore the Collection',
    heroPrimaryCtaTarget: '/produk',
    heroSecondaryCtaLabel: 'Discover Our Story',
    heroSecondaryCtaTarget: '#about',
    faqEyebrow: 'FAQ',
    faqTitle: 'A few things to know.',
    intelligenceEyebrow: 'Coming Soon',
    intelligenceTitle: 'A thoughtful eye for your space.',
    intelligenceDescription: 'Luvin Intelligence will help you find pieces that feel true to your room, your rituals, and the way you live—guided by proportion, palette, and what matters most to you.',
    intelligenceCtaLabel: 'Keep Me Informed',
  },
  siteSettings: {
    brandName: 'Luvin Home',
    brandPromise: 'Stories of Living',
    whatsAppNumber: WHATSAPP_NUMBER,
    defaultWhatsAppMessage: 'Hello Luvin Home, I would like to know more about your collection.',
    instagramUrl: INSTAGRAM_LINK,
    instagramUsername: '@luvinhome.id',
    footerText: 'Creating homes people love coming back to.',
    seoDefaultTitle: 'Luvin Home — Thoughtful Furniture for Everyday Living',
    seoDefaultDescription: 'Discover timeless, comfortable furniture designed for the rooms where life unfolds.',
  },
  collections,
  products,
  faqs,
}
