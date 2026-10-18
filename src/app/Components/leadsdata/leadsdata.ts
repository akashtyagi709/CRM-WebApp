
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../Services/user';
import { environment } from '../../../environments/environment';

type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'LOSS';
type StatusFilter = 'ALL' | LeadStatus;

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  msg: string;
  success: boolean;
  data: T;
}

type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-leadsdata',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './leadsdata.html',
  styleUrl: './leadsdata.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Leadsdata implements OnInit {
  searchText = '';
  statusFilter: StatusFilter = 'ALL';

  currentPage = 1;
  pageSize = 5;

  loading = false;
  errorMessage = '';

  showStatusModal = false;
  selectedLead: Lead | null = null;
  selectedStatus: LeadStatus = 'NEW';
  savingStatus = false;

  readonly pageSizeOptions = [5, 10, 25];

  readonly statuses: LeadStatus[] = [
    'NEW',
    'CONTACTED',
    'CONVERTED',
    'LOSS'
  ];

  leads: Lead[] = [];

  private readonly apiBaseUrl =
    environment.apiUrl.replace(/\/+$/, '');

  constructor(
    protected service: User,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getLeadsData();
  }

  getLeadsData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.service.apiCall<ApiResponse<Lead[]>>(
      environment.leads,
      {}
    ).subscribe({
      next: (response) => {
        this.leads = Array.isArray(response?.data)
          ? response.data
          : [];

        this.currentPage = 1;
        this.loading = false;
        this.cdr.markForCheck();

        console.log('Leads loaded:', this.leads);
      },
      error: (error) => {
        console.error('Failed to fetch leads:', error);

        this.leads = [];
        this.loading = false;
        this.errorMessage =
          'Unable to load leads. Please try again.';

        this.cdr.markForCheck();
      }
    });
  }

  openStatusModal(lead: Lead): void {
    this.selectedLead = lead;
    this.selectedStatus = lead.status;
    this.showStatusModal = true;
    this.cdr.markForCheck();
  }

  closeStatusModal(): void {
    if (this.savingStatus) {
      return;
    }

    this.showStatusModal = false;
    this.selectedLead = null;
    this.cdr.markForCheck();
  }

  onModalStatusChange(event: Event): void {
    this.selectedStatus =
      (event.target as HTMLSelectElement).value as LeadStatus;

    this.cdr.markForCheck();
  }

  saveStatus(): void {
    const lead = this.selectedLead;

    if (!lead || this.savingStatus) {
      return;
    }

    if (this.selectedStatus === lead.status) {
      this.closeStatusModal();
      return;
    }

    this.savingStatus = true;
    this.cdr.markForCheck();

    const url =
      `${this.apiBaseUrl}/${environment.leads}/${lead.id}/status`;

    this.http.post<ApiResponse<Lead>>(url, {
      status: this.selectedStatus
    }).subscribe({
      next: (response) => {
        if (response?.success && response.data) {
          const updatedLead = response.data;

          this.leads = this.leads.map((item) =>
            item.id === lead.id
              ? { ...item, ...updatedLead }
              : item
          );

          this.showStatusModal = false;
          this.selectedLead = null;
          this.errorMessage = '';

          console.log('Lead status updated:', updatedLead);
        } else {
          this.errorMessage =
            response?.msg || 'Unable to update lead status.';
        }

        this.savingStatus = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to update lead status:', error);

        this.errorMessage =
          error?.error?.msg || 'Failed to update lead status.';

        this.savingStatus = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredLeads(): Lead[] {
    const query = this.searchText.trim().toLowerCase();

    return this.leads.filter((lead) => {
      const matchesSearch =
        !query ||
        (lead.name ?? '').toLowerCase().includes(query) ||
        (lead.email ?? '').toLowerCase().includes(query) ||
        (lead.phone ?? '').toLowerCase().includes(query) ||
        (lead.message ?? '').toLowerCase().includes(query);

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        lead.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get activePipelineCount(): number {
    return this.leads.filter(
      (lead) =>
        lead.status === 'NEW' ||
        lead.status === 'CONTACTED'
    ).length;
  }

  get convertedCount(): number {
    return this.leads.filter(
      (lead) => lead.status === 'CONVERTED'
    ).length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeads.length / this.pageSize);
  }

  get pageNumbers(): PaginationItem[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis', total];
    }

    if (current >= total - 3) {
      return [
        1,
        'ellipsis',
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total
      ];
    }

    return [
      1,
      'ellipsis',
      current - 1,
      current,
      current + 1,
      'ellipsis',
      total
    ];
  }

  get paginatedLeads(): Lead[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredLeads.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get pageStart(): number {
    return this.filteredLeads.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredLeads.length
    );
  }

  onSearch(event: Event): void {
    this.searchText =
      (event.target as HTMLInputElement).value;

    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter =
      (event.target as HTMLSelectElement).value as StatusFilter;

    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  goToPage(page: number): void {
    const lastPage = Math.max(1, this.totalPages);

    this.currentPage = Math.max(
      1,
      Math.min(page, lastPage)
    );

    this.cdr.markForCheck();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = Number(
      (event.target as HTMLSelectElement).value
    );

    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  isPageNumber(page: PaginationItem): page is number {
    return typeof page === 'number';
  }
}
