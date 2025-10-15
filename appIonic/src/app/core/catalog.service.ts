import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
@Injectable({ providedIn: "root" })
export class CatalogService {
  private http = inject(HttpClient);
  private base = environment.apiBase + "/catalog";
  list(page = 1, pageSize = 20) {
    return this.http.get<{ items: any[]; total: number }>(
      `${this.base}/products`,
      { params: { page, size: pageSize } as any }
    );
  }
  get(id: number) {
    return this.http.get<any>(`${this.base}/products/${id}`);
  }
  stock(id: number) {
    return this.http.get<{ productId: number; stock: number }>(
      `${this.base}/stock/${id}`
    );
  }
}
