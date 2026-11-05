import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Libro } from '../../models/libro.model';
import { LibroService } from '../../services/LibroService';

@Component({
  selector: 'app-libro-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './libro-form.html',
  styleUrl: './libro-form.css'
})
export class LibroForm implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private libroService = inject(LibroService);

  id: number | null = null;
  error = signal<string>('');

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(255)]],
    autor: ['', Validators.required],
    anioPublicacion: [null as number | null, [Validators.required, Validators.min(0), Validators.max(2100)]],
    genero: ['', Validators.required]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.libroService.obtener(this.id).subscribe({
        next: (libro) => this.form.patchValue(libro),
        error: () => this.error.set('No se encontró el libro')
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const libro = this.form.value as Libro;

    const peticion = this.id
      ? this.libroService.actualizar(this.id, libro)
      : this.libroService.crear(libro);

    peticion.subscribe({
      next: () => this.router.navigate(['/libros']),
      error: () => this.error.set('No se pudo guardar el libro')
    });
  }
}