import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Libro } from '../../models/libro.model';
import { LibroService } from '../../services/LibroService';

@Component({
  selector: 'app-libro-detalle',
  imports: [RouterLink],
  templateUrl: './libro-detalle.html',
  styleUrl: './libro-detalle.css'
})
export class LibroDetalle implements OnInit {

  private route = inject(ActivatedRoute);
  private libroService = inject(LibroService);

  libro = signal<Libro | null>(null);
  error = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.libroService.obtener(id).subscribe({
      next: (data) => this.libro.set(data),
      error: () => this.error.set('No se encontró el libro')
    });
  }
}