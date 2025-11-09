import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HomePage } from './home.page';
import {
  UserProfile,
  UserProfileService,
} from '../services/user-profile.service';
import { CartService } from '../services/cart.service';

class MockUserProfileService implements Partial<UserProfileService> {
  user$ = new BehaviorSubject<UserProfile>({
    name: 'Guest User',
    phone: '—',
    email: '',
    avatarUrl: 'assets/icon/jay.png',
  });
  getUserSnapshot() {
    return this.user$.getValue();
  }
}

class MockCartService {
  addItem = jasmine.createSpy('addItem');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
}

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let userService: MockUserProfileService;
  let router: MockRouter;
  let cart: MockCartService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: UserProfileService, useClass: MockUserProfileService },
        { provide: CartService, useClass: MockCartService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserProfileService) as any;
    router = TestBed.inject(Router) as any;
    cart = TestBed.inject(CartService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects guest to login with returnUrl and addItem', () => {
    // guest is default (email empty)
    component.addToCart('Amouré Elegance');
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/cart', addItem: 'Amouré Elegance' },
    });
    expect(cart.addItem).not.toHaveBeenCalled();
  });

  it('adds to cart for logged-in user', () => {
    userService.user$.next({
      name: 'Alice',
      phone: '123456',
      email: 'alice@example.com',
      avatarUrl: 'assets/icon/jay.png',
    });
    component['user'] = userService.getUserSnapshot();
    component.addToCart('Amouré Elegance');
    expect(cart.addItem).toHaveBeenCalledWith('Amouré Elegance', 1);
  });
});
