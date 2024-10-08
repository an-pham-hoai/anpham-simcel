import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryDialogComponent } from './inventory-dialog.component';

describe('InventoryDialogComponent', () => {
  let component: InventoryDialogComponent;
  let fixture: ComponentFixture<InventoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
