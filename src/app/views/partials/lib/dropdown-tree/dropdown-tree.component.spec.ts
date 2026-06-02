import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownTreeComponent } from './dropdown-tree.component';

describe('DropdownTreeComponent', () => {
  let component: DropdownTreeComponent;
  let fixture: ComponentFixture<DropdownTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownTreeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});