import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Product { id:number; name:string; description?:string; price:number; imageUrl?:string; createdAt:string; }
export interface Paged<T> { page:number; size:number; total:number; items:T[]; }

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}
  list(search?:string, page=1, size=12) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Paged<Product>>(`${this.base}/catalog/products`, { params });
  }
  get(id:number){ return this.http.get<Product>(`${this.base}/catalog/products/${id}`); }
  stock(id:number){ return this.http.get<{productId:number,stock:number}>(`${this.base}/catalog/stock/${id}`); }
}
