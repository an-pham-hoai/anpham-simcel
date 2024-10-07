import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as CryptoJS from 'crypto-js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ]
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar // Inject MatSnackBar
    ) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    async onSubmit() {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.errorMessage = null; // Reset error message

        const { username, password } = this.loginForm.value;
        // MD5 hash the password before sending
        const hashedPassword = CryptoJS.MD5(password).toString();

        // Subscribe to the AuthService's login method
        this.authService.login(username, hashedPassword).subscribe({
            next: (response) => {
                // Handle successful login
                localStorage.setItem(AuthService.TokenKey, response.access_token);
                console.log(`set ${AuthService.TokenKey}: ${response.access_token}`);
                this.router.navigate(['/inventory']); // Navigate to home or another route
            },
            error: (error) => {
                // Handle error responses
                this.loading = false;
                if (error.status === 401) {
                    this.openSnackBar('Unauthorized. Please check your credentials.', 'Close');
                } else {
                    this.openSnackBar('Login failed. Please try again.', 'Close');
                }
            },
            complete: () => {
                // Any cleanup or final steps (optional)
                this.loading = false;
            }
        });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 5000, // Duration in milliseconds
            horizontalPosition: 'center', // Adjust the horizontal position
            verticalPosition: 'top', // Adjust the vertical position
        });
    }
}
