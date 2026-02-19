import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsMedicoPage } from './tabs-medico.page';

describe('TabsMedicoPage', () => {
  let component: TabsMedicoPage;
  let fixture: ComponentFixture<TabsMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
