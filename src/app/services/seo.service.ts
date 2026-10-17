import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private doc = inject(DOCUMENT);

  readonly siteBaseUrl = 'https://learnwithyounis.vercel.app';
  readonly defaultTitle = 'تعلم مع يونس - Learn With Younis | منصة وألعاب تعليم الأطفال';
  readonly defaultDesc = 'منصة تفاعلية مجانية وشاملة لتعليم الأطفال الإنجليزية والعربية: الحروف، الكلمات، الأرقام، نطق الفونكس، وقصص وألعاب أطفال ممتعة ومفيدة.';
  readonly defaultKeywords = 'تعلم مع يونس, Learn With Younis, تعليم الانجليزية للاطفال, تعليم الحروف الانجليزية, العاب تعليمية للاطفال, فونكس اطفال, قصص اطفال بالانجليزي, تعليم الحروف العربية, تعليم الارقام للاطفال, اوراق عمل اطفال, العاب اطفال اونلاين, تعلم القراءة والكتابة, كورس انجليزي مجاني للاطفال';

  init() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }

      const routeData = route.snapshot.data || {};
      const pageTitle = route.snapshot.title 
        ? `${route.snapshot.title} | تعلم مع يونس` 
        : this.defaultTitle;
      const pageDesc = routeData['description'] || this.defaultDesc;
      const pageKeywords = routeData['keywords'] || this.defaultKeywords;
      const fullUrl = `${this.siteBaseUrl}${this.router.url === '/' ? '' : this.router.url.split('?')[0]}`;

      this.updateMetadata(pageTitle, pageDesc, pageKeywords, fullUrl);
    });
  }

  updateMetadata(title: string, description: string, keywords: string, url: string) {
    this.titleService.setTitle(title);

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: url });

    // Twitter
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    // Canonical link
    this.updateCanonicalUrl(url);
  }

  private updateCanonicalUrl(url: string) {
    try {
      let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
      if (!link) {
        link = this.doc.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.doc.head.appendChild(link);
      }
      link.setAttribute('href', url);
    } catch { /* ignore */ }
  }
}
