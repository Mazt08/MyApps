import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageResolverService {
  private cache = new Map<string, string[]>();
  private inflight = new Map<string, Promise<string[]>>();

  // Manual overrides for filenames that don't match simple slug patterns.
  // This avoids needing to rename asset files immediately.
  private static OVERRIDES: Record<string, string[]> = {
    'yara elixir': ['assets/PRODUCT-PIC/LATTAFA.png'], // brand fallback until a specific Yara Elixir image is added
    'asad elixir': ['assets/PRODUCT-PIC/Asa- Elixir.png'], // asset has a missing 'd' and space after hyphen
    'fire on ice': ['assets/PRODUCT-PIC/Fire-On-ce.png'], // file spelled On-ce
    'mayar cherry intense': ['assets/PRODUCT-PIC/Mayar-Cherr-yIntense.png'],
    'club de nuit milestone': [
      'assets/PRODUCT-PIC/CLUB-DE-NUIT-MILESTONE-EAU-DE-PARFUM .png',
    ], // trailing space before .png
    'club de nuit iconic': [
      'assets/PRODUCT-PIC/CLUB-DE-NUIT-ICONIC-EAU-DE-PARFUM.png',
    ],
    'club de nuit untold': [
      'assets/PRODUCT-PIC/CLUB-DE-NUIT-UNTOLD-EAU-DE-PARFUM.png',
    ],
  };

  async resolveImages(productName: string): Promise<string[]> {
    const key = productName.trim().toLowerCase();
    if (this.cache.has(key)) return this.cache.get(key)!;
    if (this.inflight.has(key)) return this.inflight.get(key)!;

    const p = this._resolve(productName).then((arr) => {
      this.cache.set(key, arr);
      this.inflight.delete(key);
      return arr;
    });
    this.inflight.set(key, p);
    return p;
  }

  async resolveFirst(productName: string): Promise<string | undefined> {
    const images = await this.resolveImages(productName);
    return images[0];
  }

  private async _resolve(productName: string): Promise<string[]> {
    const base = 'assets/PRODUCT-PIC';
    const nameRaw = productName.trim();
    const slug = this.slugify(nameRaw);
    const dashRaw = nameRaw.replace(/\s+/g, '-'); // preserve original casing but dash-separate words
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];

    // If overrides exist, test them first and short‑circuit when any found.
    const override = ImageResolverService.OVERRIDES[productName.toLowerCase()];
    if (override && override.length) {
      const ok = await this.filterExisting(override);
      if (ok.length) return ok; // stop early if we matched manual mapping
    }

    const candidates = new Set<string>();
    const push = (p: string) => candidates.add(p);

    // Direct filename variants
    for (const ext of exts) {
      push(`${base}/${nameRaw}.${ext}`);
      push(`${base}/${slug}.${ext}`);
      push(`${base}/${dashRaw}.${ext}`);
      push(`${base}/${slug.toUpperCase()}.${ext}`);
    }

    // Indexed variants (name-1.jpg ...) up to 6
    for (let i = 1; i <= 6; i++) {
      for (const ext of exts) {
        push(`${base}/${nameRaw}-${i}.${ext}`);
        push(`${base}/${slug}-${i}.${ext}`);
      }
    }

    // Optional nested folder by slug (slug/1.jpg etc.)
    for (let i = 1; i <= 6; i++) {
      for (const ext of exts) {
        push(`${base}/${slug}/${i}.${ext}`);
      }
    }

    // Extra variants with common marketing suffixes often found in raw assets
    const suffixes = [
      '-EAU-DE-PARFUM',
      '-EAU-DE-PARFUM ', // include accidental trailing space variant
    ];
    for (const suf of suffixes) {
      for (const ext of exts) {
        push(`${base}/${slug + suf}.${ext}`);
        push(`${base}/${nameRaw.replace(/\s+/g, '-') + suf}.${ext}`);
        // Uppercase variant
        push(`${base}/${slug.toUpperCase() + suf}.${ext}`);
      }
    }

    const urls = Array.from(candidates.values());
    const results = await this.filterExisting(urls);
    return results;
  }

  private filterExisting(urls: string[]): Promise<string[]> {
    return new Promise((resolve) => {
      const good: string[] = [];
      let done = 0;
      if (urls.length === 0) return resolve(good);
      urls.forEach((u) => {
        const img = new Image();
        const finalize = () => {
          done++;
          if (done === urls.length) resolve(good);
        };
        img.onload = () => {
          good.push(u);
          finalize();
        };
        img.onerror = finalize;
        img.src = encodeURI(u);
      });
    });
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .replace(/-{2,}/g, '-');
  }
}
