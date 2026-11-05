import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibroLista } from './libro-lista';

describe('LibroLista', () => {
  let component: LibroLista;
  let fixture: ComponentFixture<LibroLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibroLista],
    }).compileComponents();

    fixture = TestBed.createComponent(LibroLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
