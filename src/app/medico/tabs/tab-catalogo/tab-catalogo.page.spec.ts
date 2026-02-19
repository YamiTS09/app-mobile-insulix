import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabCatalogoPage } from './tab-catalogo.page';

describe('TabCatalogoPage', () => {
  let component: TabCatalogoPage;
  let fixture: ComponentFixture<TabCatalogoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabCatalogoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
