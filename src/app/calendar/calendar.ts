import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {
  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  holidays: { name: string; date: string }[] = [];
  events: { name: string; date: string }[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private eventService: EventService
  ) {}

  async ngOnInit() {
    console.log(' CalendarComponent initialized');
    this.loadEvents();         // Load events from service
    await this.loadHolidays(); // Fetch holidays from API
  }

  get monthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  loadEvents() {
    this.events = this.eventService.getEvents();
    console.log(` Loaded ${this.events.length} events`);
  }

  loadHolidays() {
    const API_KEY = 'dS8T6kseVCfXqNWYoOE1GcCjElsCXc2T';
    const country = 'IN';
    const year = this.currentYear;
    const month = this.currentMonth + 1;

    const url = `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${country}&year=${year}&month=${month}`;

    return this.http.get<any>(url).toPromise().then(
      (response) => {
        console.log('Calendarific Response:', response);
        // In loadHolidays() method
          this.holidays = response?.response?.holidays.map((h: any) => ({
            name: h.name,
            date: h.date.iso.split('T')[0] // This is correct as API returns UTC
          }));
        
        console.log(` Holidays loaded: ${this.holidays.length}`);
      },
      (err) => {
        console.error('Calendarific API error:', err);
        alert('Could not fetch holidays. Please check your Calendarific API key or internet.');
      }
    );
  }

  getCalendarDays(): { day: number | null, date: string }[] {
  const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
  const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  const days: { day: number | null, date: string }[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: '' });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(this.currentYear, this.currentMonth, day);
    // Use local date components instead of ISO string
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const date = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${date}`;
    days.push({ day, date: dateStr });
  }

  return days;
}

  async nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    await this.loadHolidays();
  }

  async prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    await this.loadHolidays();
  }

  isHoliday(date: string): boolean {
    return this.holidays.some(h => h.date === date);
  }

  getHolidayName(date: string): string {
    const holiday = this.holidays.find(h => h.date === date);
    return holiday?.name ?? '';
  }

  isEvent(date: string): boolean {
    return this.events.some(e => e.date === date);
  }

  getEventName(date: string): string {
    const event = this.events.find(e => e.date === date);
    return event?.name ?? '';
  }

  onDateClick(date: string) {
    if (this.isHoliday(date)) {
      const name = this.getHolidayName(date);
      alert(` ${date} is a holiday: ${name}`);
      console.log(` Clicked on ${date}`);
    } else if (this.isEvent(date)) {
      const name = this.getEventName(date);
      alert(` ${date} has an event: ${name}`);
    } else {
      alert(`${date} has no holidays or events.`);
    }
  }

  goToAddEvent() {
    this.router.navigate(['/guests']);
  }
}
