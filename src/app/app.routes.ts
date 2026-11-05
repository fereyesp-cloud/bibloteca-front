import { Routes } from '@angular/router';
import { LibroLista } from './components/libro-lista/libro-lista';
import { LibroDetalle } from './components/libro-detalle/libro-detalle';
import { LibroForm } from './components/libro-form/libro-form';

export const routes: Routes = [
  { path: '', redirectTo: 'libros', pathMatch: 'full' },
  { path: 'libros', component: LibroLista },
  { path: 'libros/nuevo', component: LibroForm },
  { path: 'libros/editar/:id', component: LibroForm },
  { path: 'libros/:id', component: LibroDetalle }
];