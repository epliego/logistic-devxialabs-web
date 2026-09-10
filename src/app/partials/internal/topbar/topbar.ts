import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'topbar-root',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Topbar {
  // protected readonly title = signal('zoom-web');

  public async ngOnInit(): Promise<void> {}
}
