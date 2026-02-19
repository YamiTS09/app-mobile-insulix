import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabBienestarPage } from './tab-bienestar.page';

describe('TabBienestarPage', () => {
  let component: TabBienestarPage;
  let fixture: ComponentFixture<TabBienestarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabBienestarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
