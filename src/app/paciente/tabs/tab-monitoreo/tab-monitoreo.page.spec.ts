import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabMonitoreoPage } from './tab-monitoreo.page';

describe('TabMonitoreoPage', () => {
  let component: TabMonitoreoPage;
  let fixture: ComponentFixture<TabMonitoreoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabMonitoreoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
