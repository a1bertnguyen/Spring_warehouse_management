import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseManager } from './warehouse-manager';

describe('WarehouseManager', () => {
  let component: WarehouseManager;
  let fixture: ComponentFixture<WarehouseManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
