import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchResult {
  type: 'booking' | 'order' | 'service' | 'complaint' | 'user' | 'pg';
  id: string;
  title: string;
  description: string;
  status?: string;
  amount?: number;
  date?: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$ = this.searchQuerySubject.asObservable();

  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  private isSearching = new BehaviorSubject<boolean>(false);
  public isSearching$ = this.isSearching.asObservable();

  constructor() {}

  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  getSearchQuery(): string {
    return this.searchQuerySubject.value;
  }

  setSearchResults(results: SearchResult[]): void {
    this.searchResultsSubject.next(results);
  }

  getSearchResults(): SearchResult[] {
    return this.searchResultsSubject.value;
  }

  setIsSearching(isSearching: boolean): void {
    this.isSearching.next(isSearching);
  }

  clearSearch(): void {
    this.searchQuerySubject.next('');
    this.searchResultsSubject.next([]);
  }

  // Generic search filter function
  filterResults(
    query: string,
    items: any[],
    searchFields: string[]
  ): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(lowerQuery);
      })
    );
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
