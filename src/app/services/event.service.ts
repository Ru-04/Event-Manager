import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EventService {
  private storageKey = 'events';

  addEvent(event: { name: string; date: string }) {
    const events = this.getEvents();
    events.push(event);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    console.log(`📌 Event stored locally: ${event.name} - ${event.date}`);
  }

  getEvents(): { name: string; date: string }[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  isEvent(date: string): boolean {
    return this.getEvents().some(e => e.date === date);
  }

  getEventName(date: string): string | null {
    const event = this.getEvents().find(e => e.date === date);
    return event ? event.name : null;
  }
}
