import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabHistorialPage } from './tab-historial.page';

describe('TabHistorialPage', () => {
  let component: TabHistorialPage;
  let fixture: ComponentFixture<TabHistorialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabHistorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
