import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabReportesPage } from './tab-reportes.page';

describe('TabReportesPage', () => {
  let component: TabReportesPage;
  let fixture: ComponentFixture<TabReportesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabReportesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
