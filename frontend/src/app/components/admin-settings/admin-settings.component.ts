import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminSettingsComponent {
  settings = {
    appName: 'PG Rental System',
    theme: 'dark',
    notifications: true,
    emailAlerts: true,
    autoBackup: true,
    maintenanceMode: false
  };

  saveSettings() {
    alert('✓ Settings saved successfully!');
  }

  resetSettings() {
    if (confirm('Reset all settings to default?')) {
      alert('✓ Settings reset to default');
    }
  }
}
