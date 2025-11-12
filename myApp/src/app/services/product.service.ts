import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number | null; // null means price not listed
  category: string; // e.g., 'Featured', 'Armaf / Club de Nuit', 'Other Brands'
  image?: string;
  featured?: boolean;
  active: boolean;
  description?: string;
  // Added extended detail fields (placeholders until real content provided)
  notes?: string; // fragrance notes breakdown
  longevity?: string; // projected longevity performance
  volume?: string; // bottle volume or variant e.g. '100ml'
  createdAt: number;
  updatedAt: number;
}

// Bump storage key to force reseed with new catalog
const STORAGE_KEY = 'products_v2';

// Optional: fill this map with details scraped or pasted from your source doc.
// Keys should match product names exactly (case-insensitive compare is applied).
const DESCRIPTION_MAP: Record<string, Partial<Product>> = {
  'Yara Elixir': {
    volume: '100ML',
    description: `A richer evolution of the original Yara, this scent trades softness for fun and intoxicating chaos, and is something you want to get into. At the top, a playful burst of strawberry s'mores and black currant teases the senses with gourmand warmth and juicy contrast. The heart blooms with jasmine and orange flower, adding a floral tension that's both attractive and provocative. Anchoring it all is a base of vanilla bean, caramel, amber, and musk—decadent, creamy, and dangerously addictive. This is trouble. The kind you want to get into.`,
    notes: `Top: Strawberry s'mores, Black Currant\nMiddle: Jasmine, Orange Flower\nBase: Vanilla, Caramel, Amber, Musk`,
  },
  'Asad Elixir': {
    volume: '100ML',
    description: `A deeper, more concentrated evolution of the original Asad. The opening is sharp, spicy, and full of tension, with notes of pink pepper, saffron, and grapefruit. The heart reveals a smoky blend of tobacco and cedarwood, softened by a touch of vanilla. At its base: earthy patchouli, resinous olibanum, smooth cashmeran, and dry amber. This is trouble. And you were made for it.`,
    notes: `Top: Pink Pepper, Saffron, Grapefruit\nMiddle: Tobacco, Cedarwood, Vanilla\nBase: Patchouli, Olibanum, Cashmeran, Dry Amber`,
  },
  'Eclaire Banoffi': {
    volume: '100ML',
    description: `A decadent gourmand inspired by the classic banoffee dessert. It opens with creamy banana and dulce de leche, melts into a plush heart of whipped cream and vanilla, and settles into a cozy base of praline, biscuit and soft musk. Playful yet refined, it’s sweet-tooth comfort with an addictive trail.`,
    notes: `Top: Banana Cream, Dulce De Leche\nMiddle: Whipped Cream, Vanilla\nBase: Praline, Biscuit, Musk`,
  },
  'Eclaire Pistache': {
    volume: '100ML',
    description: `A creamy gourmand centred on pistachio. It opens with pistachio cream and toasted pistachio, melts into a plush heart of coconut, cacao and whipped cream, and settles into a comforting base of vanilla, milk and soft musk. Smooth, cozy and deliciously modern, it’s an easy everyday signature with a soft, addictive trail.`,
    notes: `Top: Pistachio Cream, Toasted Pistachio\nMiddle: Coconut, Cacao, Whipped Cream\nBase: Vanilla, Milk, Musk`,
  },
  'Whipped Pleasure': {
    volume: '75ML',
    description: `Experience the indulgent essence of Lattafa Give Me Gourmand Collection Whipped Pleasure EDP. This spray masterfully blends rich whipped cream and smooth caramel notes, creating a luxurious gourmand fragrance. Designed for those who appreciate refined sweetness, it offers a warm, creamy scent that captivates and delights throughout the day. Perfect for adding a touch of sophisticated comfort to any occasion.`,
    notes: `Top: Caramel Popcorn, Salted Caramel\nMiddle: Jasmine, Milk\nBase: Tonka, Benzoin, Musk, Ambrofix`,
  },
  'Vanilla Freak': {
    volume: '75ML',
    description: `From Lattafa's Gourmand Collection, this captivating Eau de Parfum blends rich vanilla notes with sweet, gourmand accords to create a warm and inviting scent. Perfect for those seeking a sophisticated yet indulgent aroma, it radiates comfort and elegance throughout the day. Its long-lasting formula ensures you stay enveloped in its luscious fragrance from morning until night.`,
    notes: `Top: Cupcake Accord\nMiddle: Cinnamon, Almond, Sugar Frosting\nBase: Vanilla, Musk, Butter Cream`,
    longevity: 'Long-lasting',
  },
  'Raed Gold': {
    volume: '100ML',
    description: `An amber-spicy unisex fragrance with a vibrant, juicy opening and a complex warm base. Plush fruits and florals drift into aromatic herbs and spices before settling into a cozy trail of woods, musks, vanilla and tonka.`,
    notes: `Top: Juniper, Watermelon, Pineapple, Pink Pepper, Jasmine, Silk Tree Blossom\nMiddle: Herbal Notes, Sage, Lavender, Cinnamon\nBase: Ice, Vetiver, Sandalwood, Amber, Strawberry, Vanilla, Musk, Tonka Bean, Chestnut`,
  },
  Emaan: {
    description: `A chypre-floral for women launched in 2022. Luminous citruses and black currant lead into a classical white floral heart, resting on a comforting base of vanilla, musk, patchouli and cedarwood.`,
    notes: `Top: Orange Blossom, Bergamot, Black Currant\nMiddle: Tuberose, Jasmine, Marigold\nBase: Vanilla, Musk, Patchouli, Cedarwood`,
  },
  Qimmah: {
    description: `A modern feminine signature that contrasts a delicious almond–coffee opening with lush white florals, melting into a sensual base of vanilla, cacao and sandalwood.`,
    notes: `Top: Almond, Coffee\nMiddle: Tuberose, Tonka, Jasmine\nBase: Vanilla, Cacao, Sandalwood`,
  },
  'Mayar Cherry Intense': {
    volume: '100ML',
    description: `A captivating unisex fragrance that blends ripe cherries with rich oriental and gourmand facets for an indulgent, sensual trail. Bold yet elegant; perfect for statement wear.`,
    notes: `Top: Strawberry, Bergamot\nMiddle: Cherry Jam, Cacao\nBase: Vanilla, Patchouli, Amber`,
  },
  Teriaq: {
    volume: '100ML',
    description: `A new 2024 release by Quentin Bisch. Luscious caramel and bitter almond meet juicy apricot and pink pepper over a heart of honeyed florals, finishing with a plush leathery–resinous base.`,
    notes: `Top: Caramel, Bitter Almond, Apricot, Pink Pepper\nMiddle: Honey, Rhubarb, White Flowers, Rose\nBase: Leather, Vanilla, Musk, Vetiver, Labdanum`,
  },
  'Fire On Ice': {
    volume: '110ML',
    description: `Born from the tension of extremes: black raspberry turned bold and boozy, rose petals frozen in heat, and grounding oakwood. The moment where ice becomes flame and fire crystallizes—freeze it, burn it, wear both.`,
    notes: `Top: Black Raspberry, Cinnamon, Cognac (Liquor)\nMiddle: Frozen Rose Petals, Caramel, Moss\nBase: Oakwood, Myrrh, Cedarwood, Ambroxan`,
  },
  'Habik for Women': {
    volume: '100ML',
    description: `Opens with a sparkling duo of bergamot and juicy pear. A graceful bouquet of jasmine, lily of the valley, and freesia blooms at the heart. A warm base of musk, dry amber, and oakmoss leaves a chic, feminine and lasting trail.`,
    notes: `Top: Bergamot, Pear\nMiddle: Jasmine, Lily of the Valley, Freesia\nBase: Musk, Dry Amber, Oakmoss`,
  },
  'Habik for Men': {
    volume: '100ML',
    description: `A striking masculine signature: vibrant cardamom and pepper with crisp bergamot and artemisia; a heart of lavender and sage warmed by cinnamon; grounded by sandalwood, patchouli, tonka bean, amberwood, and musk.`,
    notes: `Top: Cardamom, Pepper, Artemisia, Bergamot\nMiddle: Sage, Lavender, Cinnamon\nBase: Sandalwood, Patchouli, Tonka Bean, Amberwood, Musk`,
  },
  'His Confession': {
    volume: '100ML',
    description: `A bold, versatile composition that opens with invigorating mandarin, cinnamon, and lavender, deepening into iris, cypress, and benzoin, and settling on a warm base of vanilla, tonka, patchouli, cedarwood, incense, and amber.`,
    notes: `Top: Cinnamon, Lavender, Mandarin\nMiddle: Iris, Benzoin, Cypress, Mahonial\nBase: Vanilla, Tonka, Amber, Cedarwood, Incense, Patchouli`,
  },
  'Her Confession': {
    volume: '100ML',
    description: `A mesmerizing balance of warmth, mystery, and elegance. Opens with mystical accords and cinnamon, revealing a rich floral heart of jasmine, tuberose, and incense with mahanial, on a sensual base of tonka, musk, and vanilla.`,
    notes: `Top: Mystikal, Cinnamon\nMiddle: Tuberose, Jasmine, Incense, Mahonial\nBase: Vanilla, Tonka, Musk`,
  },
  'CLUB DE NUIT OUD': {
    volume: '105ml',
    description: `A scented narrative—Whispers of Wilderness—that unfolds like a captivating story, tracing an enchanting trail from bright fruits into a woody–amber oud signature.`,
    notes: `Top: Bergamot, Pineapple, Peach, Passion Fruit, Pear, Plum\nMiddle: Jasmine, Freesia, Violet Leaves, Cashmere Wood\nBase: Cambodian Oud, Cypriol, Crystal Amber, Musk, Vanilla`,
  },
  'CLUB DE NUIT MILESTONE': {
    volume: '200ml',
    description: `A manifestation of passion and adventure: fresh bergamot, red fruits, and marine accords lead into violet, sandalwood, and white wood, underlined by hypnotic vetiver and musk.`,
    notes: `Top: Bergamot, Red Fruits, Marine Accords\nMiddle: Violet, Sandalwood, White Wood\nBase: Vetiver, Musk, Ambroxan`,
  },
  'CLUB DE NUIT ICONIC': {
    volume: '200ml',
    description: `A fresh, sensual blend of zesty citrus and mint over soothing jasmine, warmed by amber and sandalwood. Inspired by a mixture of favorite artistic fragrances.`,
    notes: `Top: Grapefruit, Lemon, Mint, Pink Pepper, Coriander\nMiddle: Ginger, Nutmeg, Jasmine, Melon\nBase: Incense, Amber, Cedar, Sandalwood, Patchouli, Labdanum, Woody Notes`,
  },
  'CLUB DE NUIT UNTOLD': {
    volume: '200ml',
    description: `A luminous, woody-amber contrast of saffron and jasmine over radiant amberwood and ambergris, grounded by fir resin and cedar.`,
    notes: `Top: Saffron, Jasmine\nMiddle: Amberwood, Ambergris\nBase: Fir Resin, Cedar`,
  },
  'CLUB DE NUIT MALEKA': {
    volume: '3.4 oz',
    description: `Unleash your inner royalty with a fragrance that embodies elegance, power, and mystery. Bright citrus and exotic fruits open into rich florals and warm spices, settling into a luxurious trail of amber, musk, and creamy woods.`,
  },
  'MISS ARMAF CHIC': {
    volume: '100 ml',
    description: `Chic sophistication in a bottle. Bright berries and pear lead to a heart of jasmine, peony, and orange blossom, finishing on a stylish base of patchouli, musk, vanilla, ambroxan, cedar, and moss.`,
    notes: `Top: Strawberry, Raspberry, Pear, Orange, Tangerine, Bergamot, Calone\nMiddle: Jasmine, Peony, Orange Blossom\nBase: Patchouli, Musk, Vanilla, Ambroxan, Cedar, Moss`,
  },
  'OROS PURE LEATHER GOLD': {
    volume: '100ml',
    description: `A perfume like soothing music, an unwritten script—infatuated notes entwined into a scentual melody. The grandeur of purity, the embodiment of innocence.`,
    notes: `Top: Amber Woody Rose, Raspberry, Saffron\nMiddle: Birch, Geranium\nBase: Agarwood, Benzoin, Incense, Amber`,
  },
  'MINYA CARAMEL DULCE': {
    volume: '100ML',
    description: `Introducing Minya Caramel Dulce, the ultimate indulgence from the Minya line. A delicious blend of buttery popcorn, roasted chestnut, and rich chocolate melts into a base of caramel, vanilla, and brown sugar. Decadent, cozy, and irresistibly sweet.`,
    notes: `Top: Popcorn, Butter\nMiddle: Chestnut, Chocolate, Benzoin\nBase: Caramel, Vanilla, Brown Sugar`,
  },
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products$ = new BehaviorSubject<Product[]>([]);

  constructor() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        const parsed: Product[] = JSON.parse(existing);
        this.products$.next(parsed);
        // Merge in any newly added DESCRIPTION_MAP content without forcing a reseed
        this.mergeDescriptionMapIntoCurrent();
      } catch {
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  list$() {
    return this.products$.asObservable();
  }

  getAll(): Product[] {
    return this.products$.getValue();
  }

  getById(id: string): Product | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  private persist(products: Product[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    this.products$.next(products);
  }

  private uuid(): string {
    try {
      // Prefer secure UUID if available
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return (crypto as any).randomUUID();
      }
    } catch {}
    // Fallback (non-crypto) unique id
    return (
      'id-' +
      Math.random().toString(36).slice(2) +
      '-' +
      Date.now().toString(36)
    );
  }

  create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = Date.now();
    const product: Product = {
      ...input,
      id: this.uuid(),
      createdAt: now,
      updatedAt: now,
    };
    const products = [product, ...this.getAll()];
    this.persist(products);
    return product;
  }

  update(id: string, patch: Partial<Omit<Product, 'id'>>) {
    const products = this.getAll().map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
    );
    this.persist(products);
  }

  remove(id: string) {
    const products = this.getAll().filter((p) => p.id !== id);
    this.persist(products);
  }

  clearAll() {
    this.persist([]);
  }

  seedIfEmpty(defaults: Product[]) {
    if (this.getAll().length === 0) {
      this.persist(defaults);
    }
  }

  private seed() {
    const now = Date.now();
    const featured: Array<[string, number]> = [
      ['Yara Elixir', 49.99],
      ['Asad Elixir', 49.99],
      ['Eclaire Banoffi', 49.99],
      ['Eclaire Pistache', 49.99],
      ['Whipped Pleasure', 59.99],
      ['Vanilla Freak', 59.99],
      ['Raed Gold', 29.99],
      ['Emaan', 39.99],
      ['Qimmah', 29.99],
      ['Mayar Cherry Intense', 34.99],
      ['Teriaq', 49.99],
      ['Fire On Ice', 49.99],
      ['Habik for Women', 44.99],
      ['Habik for Men', 44.99],
      ['His Confession', 49.99],
      ['Her Confession', 49.99],
    ];
    const armaf: Array<[string, number]> = [
      ['CLUB DE NUIT OUD', 62.99],
      ['CLUB DE NUIT MILESTONE', 62.99],
      ['CLUB DE NUIT ICONIC', 69.99],
      ['CLUB DE NUIT UNTOLD', 62.99],
      ['CLUB DE NUIT MALEKA', 54.99],
      ['MISS ARMAF CHIC', 49.49],
    ];
    const other: Array<[string, number | null]> = [
      ['OROS PURE LEATHER GOLD', null],
      ['MINYA CARAMEL DULCE', null],
    ];

    const all: Product[] = [];
    featured.forEach(([name, price], idx) =>
      all.push({
        id: this.uuid(),
        name: `${name}`,
        price,
        category: 'Featured',
        image: 'assets/icon/favicon.png',
        featured: true,
        active: true,
        description: '',
        notes: '',
        longevity: '',
        volume: '',
        createdAt: now - idx * 1000,
        updatedAt: now - idx * 1000,
      })
    );
    armaf.forEach(([name, price], i) =>
      all.push({
        id: this.uuid(),
        name: `${name}`,
        price,
        category: 'Armaf / Club de Nuit',
        image: 'assets/icon/favicon.png',
        featured: false,
        active: true,
        description: '',
        notes: '',
        longevity: '',
        volume: '',
        createdAt: now - (featured.length + i) * 1000,
        updatedAt: now - (featured.length + i) * 1000,
      })
    );
    other.forEach(([name, price], i) =>
      all.push({
        id: this.uuid(),
        name: `${name}`,
        price,
        category: 'Other Brands',
        image: 'assets/icon/favicon.png',
        featured: false,
        active: true,
        description: '',
        notes: '',
        longevity: '',
        volume: '',
        createdAt: now - (featured.length + armaf.length + i) * 1000,
        updatedAt: now - (featured.length + armaf.length + i) * 1000,
      })
    );

    // Merge in externally supplied details by name (case-insensitive)
    const merged = all.map((p) => {
      const key = Object.keys(DESCRIPTION_MAP).find(
        (k) => k.toLowerCase() === p.name.toLowerCase()
      );
      if (!key) return p;
      return { ...p, ...DESCRIPTION_MAP[key], updatedAt: Date.now() };
    });

    this.persist(merged);
  }

  /**
   * Merge DESCRIPTION_MAP into current products so new descriptions/notes can be
   * shipped without bumping the storage key. Updates only missing/empty fields.
   */
  private mergeDescriptionMapIntoCurrent() {
    const current = this.getAll();
    if (!current.length) return;
    let anyChanged = false;
    const updated = current.map((p) => {
      const key = Object.keys(DESCRIPTION_MAP).find(
        (k) => k.toLowerCase() === p.name.toLowerCase()
      );
      if (!key) return p;
      const patch = DESCRIPTION_MAP[key];
      const next: Product = { ...p };
      let changed = false;
      const apply = (field: keyof Product) => {
        const val = (patch as any)[field];
        if (val && (!next[field] || (next[field] as any) === '')) {
          (next as any)[field] = val;
          changed = true;
        }
      };
      apply('description');
      apply('notes');
      apply('volume');
      apply('longevity');
      if (changed) {
        next.updatedAt = Date.now();
        anyChanged = true;
      }
      return next;
    });
    if (anyChanged) {
      this.persist(updated);
    }
  }
}
