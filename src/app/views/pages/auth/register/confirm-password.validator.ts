import { AbstractControl } from '@angular/forms';

export class ConfirmPasswordValidator {

	static MatchPassword(control: AbstractControl) {
		const passwordControl = control.get('password');
		const confirmPasswordControl = control.get('confirmPassword');
		if (!passwordControl || !confirmPasswordControl) {
			return null; 
		}
		const password = passwordControl.value;
		const confirmPassword = confirmPasswordControl.value;
		if (password !== confirmPassword) {
			confirmPasswordControl.setErrors({ConfirmPassword: true});
		} else {
			return null;
		}
	}
}