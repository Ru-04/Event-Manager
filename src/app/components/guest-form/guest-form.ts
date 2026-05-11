import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import emailjs from 'emailjs-com';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-guest-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './guest-form.html',
  styleUrls: ['./guest-form.css']
})
export class GuestFormComponent {
  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private router: Router
  ) {}

  event = {
    name: '',
    date: '',
    guestName: '',
    guestEmail: ''
  };

  holidaysByYear: Map<number, { date: string; name: string }[]> = new Map();
  dateStatus: 'valid' | 'holiday' | 'weekend' | 'invalid' | null = null;
  isLoading = false;

  async addEventAndInvite(): Promise<void> {
    const { name, date, guestName, guestEmail } = this.event;
    console.log('Starting event creation process...');

    if (!name || !date || !guestName || !guestEmail) {
      alert('⚠️ Please fill in all fields.');
      return;
    }

    this.isLoading = true;
    try {
      const isInvalid = await this.checkIfHoliday(date);
      if (isInvalid) {
        let message = '⚠️ Cannot book on ';
        message += this.dateStatus === 'weekend' ? 'a weekend.' : 'a holiday.';
        message += ' Please select another date.';
        alert(message);
        return;
      }

      await this.sendEmail(guestName, guestEmail, name);
      console.log('✅ Email sent successfully');
      
      // Normalize the date before saving
      const normalizedDate = this.normalizeDate(date);
      this.eventService.addEvent({ name, date: normalizedDate });
      console.log(`✅ Event "${name}" added for ${normalizedDate}`);

      alert(`✅ Event "${name}" created and invitation sent to ${guestName}.`);
      this.resetForm();
      this.router.navigate(['/calendar']);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Failed to process your request. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.event = {
      name: '',
      date: '',
      guestName: '',
      guestEmail: ''
    };
    this.dateStatus = null;
  }

  async checkIfHoliday(dateString: string): Promise<boolean> {
    if (!dateString) {
      this.dateStatus = 'invalid';
      return true;
    }

    // Normalize the date to YYYY-MM-DD format
    const normalizedDate = this.normalizeDate(dateString);
    if (!normalizedDate) {
      this.dateStatus = 'invalid';
      return true;
    }

    // Parse the normalized date
    const [yearStr, monthStr, dayStr] = normalizedDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dayStr, 10);

    const selectedDate = new Date(year, month, day);

    // Check for invalid date
    if (isNaN(selectedDate.getTime())) {
      this.dateStatus = 'invalid';
      return true;
    }

    // Check for weekend
    const isWeekend = [0, 6].includes(selectedDate.getDay());
    if (isWeekend) {
      this.dateStatus = 'weekend';
      return true;
    }

    // Check for holidays
    let holidays = this.holidaysByYear.get(year);
    if (!holidays) {
      try {
        const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=dS8T6kseVCfXqNWYoOE1GcCjElsCXc2T&country=IN&year=${year}`;
        const response: any = await this.http.get(apiUrl).toPromise();
        
        holidays = (response.response?.holidays || []).map((h: any) => ({
          date: this.normalizeDate(h.date.iso) || h.date.iso.split('T')[0],
          name: h.name
        }));
        
        this.holidaysByYear.set(year, holidays || []);
      } catch (error) {
        console.error('❌ Failed to fetch holidays:', error);
        alert('❌ Could not check holidays. Try again later.');
        return true;
      }
    }

    // Check if the date is a holiday
    const isHoliday = (holidays ?? []).some(h => h.date === normalizedDate);
    if (isHoliday) {
      this.dateStatus = 'holiday';
      return true;
    }

    this.dateStatus = 'valid';
    return false;
  }

  async sendEmail(toName: string, toEmail: string, eventName: string): Promise<void> {
    const templateParams = {
      to_name: toName,
      email: toEmail,
      event_name: eventName,
      event_date: this.event.date
    };

    await emailjs.send(
      'service_42cgpr9',
      'template_xo2eq5g',
      templateParams,
      'E7A8Qes88V3VXEqMh'
    );
  }

  /**
   * Normalizes a date string to YYYY-MM-DD format
   * @param dateString The date string to normalize (can be in various formats)
   */
  private normalizeDate(dateString: string): string {
    if (!dateString) return '';
    
    // Try parsing as ISO format first
    let date = new Date(dateString);
    
    // If that fails, try parsing as local date string
    if (isNaN(date.getTime())) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        date = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
      }
    }
    
    // If still invalid, return empty string
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Helper method to format date for display
  formatDateForDisplay(dateString: string): string {
    const normalized = this.normalizeDate(dateString);
    if (!normalized) return 'Invalid date';
    
    const date = new Date(normalized);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}