import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EventService {
  private storageKey = 'events';

  /**
   * Adds an event with normalized date handling
   * @param event The event to add (must have name and date properties)
   */
  addEvent(event: { name: string; date: string }) {
    // Normalize the date to YYYY-MM-DD format to avoid timezone issues
    const normalizedDate = this.normalizeDate(event.date);
    
    const events = this.getEvents();
    events.push({ 
      name: event.name, 
      date: normalizedDate 
    });
    
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    console.log(`📌 Event stored locally: ${event.name} - ${normalizedDate}`);
  }

  /**
   * Gets all events from local storage
   */
  getEvents(): { name: string; date: string }[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Checks if an event exists on a specific date
   * @param date The date to check in YYYY-MM-DD format
   */
  isEvent(date: string): boolean {
    const normalizedDate = this.normalizeDate(date);
    return this.getEvents().some(e => e.date === normalizedDate);
  }

  /**
   * Gets the event name for a specific date
   * @param date The date to check in YYYY-MM-DD format
   */
  getEventName(date: string): string | null {
    const normalizedDate = this.normalizeDate(date);
    const event = this.getEvents().find(e => e.date === normalizedDate);
    return event ? event.name : null;
  }

  /**
   * Normalizes a date string to YYYY-MM-DD format
   * Handles timezone issues by using local date components
   * @param dateString The date string to normalize
   */
  private normalizeDate(dateString: string): string {
    if (!dateString) return '';
    
    // Handle both ISO format (YYYY-MM-DD) and local date strings
    const date = new Date(dateString);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Clears all events from storage
   */
  clearEvents(): void {
    localStorage.removeItem(this.storageKey);
  }
}