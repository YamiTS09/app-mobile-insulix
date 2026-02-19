import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroMedicoPage } from './registro-medico.page';

describe('RegistroMedicoPage', () => {
  let component: RegistroMedicoPage;
  let fixture: ComponentFixture<RegistroMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
