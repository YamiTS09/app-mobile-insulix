import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsPacientePage } from './tabs-paciente.page';

describe('TabsPacientePage', () => {
  let component: TabsPacientePage;
  let fixture: ComponentFixture<TabsPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
