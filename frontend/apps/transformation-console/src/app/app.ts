import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly workstreams = [
    {
      name: 'Payment migration',
      status: 'Scaffolded',
      summary: 'Stripe-style provider boundary planned for the backend slice.',
    },
    {
      name: 'Warehouse optimisation',
      status: 'Scaffolded',
      summary: 'Operational signals will be served by the .NET API.',
    },
    {
      name: 'HR platform uplift',
      status: 'Scaffolded',
      summary: 'Roadmap and integration status views are reserved for C5.',
    },
    {
      name: 'Wayfinding insights',
      status: 'Scaffolded',
      summary: 'Dashboard metrics will use typed services from the frontend package.',
    },
  ];
}
