import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Libro } from '../../models/libro.model';
import { LibroService } from '../../services/LibroService';

@Component({
  selector: 'app-libro-lista',
  imports: [RouterLink],
  templateUrl: './libro-lista.html',
  styleUrl: './libro-lista.css'
})
export class LibroLista implements OnInit {

  private libroService = inject(LibroService);

  libros = signal<Libro[]>([]);
  error = signal<string>('');

  // Se ejecuta automáticamente al abrir la página
  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.libroService.listar().subscribe({
      next: (data) => this.libros.set(data),
      error: () => this.error.set('No se pudo conectar con el servidor')
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este libro?')) {
      return;
    }

    this.libroService.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar el libro')
    });
  }
}