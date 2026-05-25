import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LAR_RUNTIME_CONFIG } from '@lar/services';
import { AppShellComponent } from '@lar/ui-library';

@Component({
  imports: [AppShellComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly runtimeConfig = inject(LAR_RUNTIME_CONFIG);
}
