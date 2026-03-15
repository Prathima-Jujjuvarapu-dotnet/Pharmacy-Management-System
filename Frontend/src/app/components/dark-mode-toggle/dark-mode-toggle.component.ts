import { Component } from '@angular/core';
// Update the import path if ThemeService is located elsewhere, for example:
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dark-mode-toggle',
  imports:[CommonModule,FormsModule],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrls: ['./dark-mode-toggle.component.css']
})
export class DarkModeToggleComponent {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    this.isDarkMode = themeService.getCurrentTheme() === 'dark';
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }
}
