import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PgService {
  constructor(private api: ApiService, private authService: AuthService) {}
  
  list(params?: any) { return this.api.get('pgs', params); }
  get(id: string) { return this.api.get(`pgs/${id}`); }
  create(form: any) { return this.api.post('pgs', form); }
  update(id: string, form: any) { return this.api.put(`pgs/${id}`, form); }
  delete(id: string) { return this.api.delete(`pgs/${id}`); }
  rate(id: string, rating: number, review?: string) { return this.api.put(`pgs/${id}/rate`, { rating, review }); }
  getUserRatings() { return this.api.get('pgs/my-ratings'); }
  
  getImageUrl(imagePath: string): string { 
    return this.authService.getImageUrl(imagePath); 
  }
  
  processImages(pgs: any[]): any[] { 
    return pgs.map(pg => ({ 
      ...pg, 
      images: (pg.images || []).map((img: string) => this.getImageUrl(img)) 
    })); 
  }
}
