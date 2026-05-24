import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from '@lar/ui-library';

@Component({
  imports: [AppShellComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
