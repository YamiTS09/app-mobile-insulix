import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabPacientesPage } from './tab-pacientes.page';

describe('TabPacientesPage', () => {
  let component: TabPacientesPage;
  let fixture: ComponentFixture<TabPacientesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabPacientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
