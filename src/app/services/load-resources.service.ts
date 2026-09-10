import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadResourcesService {
  private readonly recursosCargados = new Set<string>();

  public async loadEstilos(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.loadEstile(url)));
  }

  public async loadScripts(urls: string[]): Promise<void> {
    for (const url of urls) {
      await this.loadScript(url);
    }
  }

  private loadEstile(url: string): Promise<void> {
    if (this.recursosCargados.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      // link.rel = 'stylesheet';
      link.href = url;
      link.rel = 'stylesheet';
      link.onload = () => {
        this.recursosCargados.add(url);
        resolve();
      };
      link.onerror = () => reject(new Error(`No se pudo cargar el estilo: ${url}`));
      document.head.appendChild(link);
    });
  }

  private loadScript(url: string): Promise<void> {
    if (this.recursosCargados.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // script.type = 'text/javascript';
      script.src = url;
      script.onload = () => {
        this.recursosCargados.add(url);
        resolve();
      };
      script.onerror = () => reject(new Error(`No se pudo cargar el script: ${url}`));
      document.body.appendChild(script);
    });
  }
}
