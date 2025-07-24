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
  dateStatus: 'valid' | 'holiday' | 'weekend' | null = null;

  async addEventAndInvite(): Promise<void> {
    const { name, date, guestName, guestEmail } = this.event;
     console.log(' Starting event creation process...');

    if (!name || !date || !guestName || !guestEmail) {
      alert('⚠️ Please fill in all fields.');
      return;
    }

    const isInvalid = await this.checkIfHoliday(date);
    if (isInvalid) {
      alert('⚠️ Cannot book on a holiday or weekend. Please select another date.');
      return;
    }

    try {
      await this.sendEmail(guestName, guestEmail, name);
      console.log('✅ Email sent successfully');
      this.eventService.addEvent({ name, date });
      console.log(`✅ Event "${name}" added for ${date}`);

      alert(`✅ Event "${name}" created and invitation sent to ${guestName}.`);
      this.resetForm();
      this.router.navigate(['/calendar']);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
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

  async checkIfHoliday(date: string): Promise<boolean> {
    if (!date) return true;

    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();

    const isWeekend = [0, 6].includes(selectedDate.getDay());
    if (isWeekend) {
      this.dateStatus = 'weekend';
      return true;
    }

    let holidays = this.holidaysByYear.get(year);
    if (!holidays) {
      try {
        const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=dS8T6kseVCfXqNWYoOE1GcCjElsCXc2T&country=IN&year=${year}`;
        const response: any = await this.http.get(apiUrl).toPromise();
        holidays = (response.response?.holidays || []).map((h: any) => ({
          date: h.date.iso,
          name: h.name
        }));
        this.holidaysByYear.set(year, holidays || []);
      } catch (error) {
        console.error('❌ Failed to fetch holidays:', error);
        alert('❌ Could not check holidays. Try again later.');
        return true;
      }
    }

    const isHoliday = (holidays ?? []).some(h => h.date === date);
    if (isHoliday) {
      const holiday = (holidays ?? []).find(h => h.date === date);
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
      event_name: eventName
    };

    await emailjs.send(
      'service_42cgpr9',
      'template_xo2eq5g',
      templateParams,
      'E7A8Qes88V3VXEqMh'
    );
  }
}
